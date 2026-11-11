package pruebas.globalinvoice.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import pruebas.globalinvoice.soporte.ReglasNegocio;
import pruebas.globalinvoice.soporte.Fechas;
import pruebas.globalinvoice.soporte.Usuarios;

/**
 * Endpoints de facturas: GET /invoices, GET /invoices/{id} y POST /invoices.
 * La creación es una prueba parametrizada que lee datos/facturas-api.csv: cada fila trae
 * el cuerpo, el código esperado y los impuestos esperados (o el campo que debe fallar).
 */
@Tag("api")
@Order(12)
@DisplayName("API: facturas")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FacturasApiTest {

    private static final List<String> TIPOS = List.of("Nacional", "Exportacion", "Gubernamental");

    /** Id de la primera factura creada por CP-R11, usada luego en CP-R20. */
    private static Long idFacturaCreada;

    private final ClienteApi api = new ClienteApi();

    private String tokenOperador() {
        return Sesiones.token(Usuarios.operador());
    }

    @Test
    @Order(1)
    @DisplayName("CP-R08 GET /invoices devuelve las facturas sembradas con su estructura y en orden")
    void listarFacturas() {
        ClienteApi.Respuesta respuesta = api.get("/invoices", tokenOperador());
        JsonNode facturas = respuesta.json();

        assertThat(respuesta.codigo()).isEqualTo(200);
        assertThat(facturas.isArray()).isTrue();
        assertThat(facturas.size()).isGreaterThanOrEqualTo(7);
        assertThat(respuesta.milisegundos()).as("tiempo de respuesta").isLessThan(1000);

        List<OffsetDateTime> fechas = new ArrayList<>();
        for (JsonNode factura : facturas) {
            assertThat(factura.path("number").asText()).matches("FAC-\\d{5}");
            assertThat(factura.path("customerName").asText()).isNotBlank();
            assertThat(TIPOS).contains(factura.path("type").asText());
            BigDecimal subtotal = factura.path("subtotal").decimalValue();
            BigDecimal esperado = subtotal.add(factura.path("iva").decimalValue())
                    .subtract(factura.path("retencion").decimalValue());
            assertThat(factura.path("total").decimalValue()).isEqualByComparingTo(esperado);
            fechas.add(Fechas.parsear(factura.path("createdAt").asText()));
        }
        // De la más reciente a la más antigua.
        List<OffsetDateTime> ordenadas = new ArrayList<>(fechas);
        ordenadas.sort((a, b) -> b.compareTo(a));
        assertThat(fechas).containsExactlyElementsOf(ordenadas);
    }

    @Test
    @Order(2)
    @DisplayName("CP-R09 GET /invoices/999999 devuelve 404")
    void facturaInexistente() {
        assertThat(api.get("/invoices/999999", tokenOperador()).codigo()).isEqualTo(404);
    }

    @Test
    @Order(3)
    @DisplayName("CP-R10 GET /invoices sin token devuelve 401")
    void listarSinToken() {
        assertThat(api.get("/invoices", null).codigo()).isEqualTo(401);
    }

    @Order(4)
    @ParameterizedTest(name = "{0} {1} -> {6}")
    @CsvFileSource(resources = "/datos/facturas-api.csv", numLinesToSkip = 1)
    void crearFactura(String caso, String descripcion, String cliente, int tipo, BigDecimal subtotal,
                      String codigoAduanero, int estadoEsperado, BigDecimal ivaEsperado,
                      BigDecimal retencionEsperada, BigDecimal totalEsperado, String campoError) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("customerName", expandirCliente(cliente));
        cuerpo.put("type", tipo);
        cuerpo.put("subtotal", subtotal);
        if (codigoAduanero != null) {
            cuerpo.put("customsCode", codigoAduanero);
        }

        ClienteApi.Respuesta respuesta = api.post("/invoices", cuerpo, tokenOperador());
        assertThat(respuesta.codigo()).as(caso + " código HTTP").isEqualTo(estadoEsperado);

        JsonNode json = respuesta.json();
        if (estadoEsperado == 201) {
            // Valores esperados del CSV y, además, verificados contra el oráculo.
            ReglasNegocio.Impuestos oraculo = ReglasNegocio.calcular(tipo, subtotal);
            assertThat(ivaEsperado).as("el CSV coincide con el oráculo").isEqualByComparingTo(oraculo.iva());
            assertThat(json.path("number").asText()).matches("FAC-\\d{5}");
            assertThat(json.path("iva").decimalValue()).isEqualByComparingTo(ivaEsperado);
            assertThat(json.path("retencion").decimalValue()).isEqualByComparingTo(retencionEsperada);
            assertThat(json.path("total").decimalValue()).isEqualByComparingTo(totalEsperado);
            if (tipo == 2) {
                assertThat(json.path("customsCode").asText()).isEqualTo(codigoAduanero);
            } else {
                assertThat(json.path("customsCode").isNull()).as("sin código aduanero").isTrue();
            }
            assertThat(respuesta.cabeceras().getFirst("Location"))
                    .endsWithIgnoringCase("/api/invoices/" + json.path("id").asLong());
            if (idFacturaCreada == null) {
                idFacturaCreada = json.path("id").asLong();
            }
        } else {
            assertThat(AutenticacionApiTest.camposConError(json)).contains(campoError.toLowerCase());
        }
    }

    @Test
    @Order(5)
    @DisplayName("CP-R20 La factura creada se puede consultar por su id con los mismos datos")
    void consultarFacturaCreada() {
        assertThat(idFacturaCreada).as("CP-R11 debió crear una factura").isNotNull();
        ClienteApi.Respuesta respuesta = api.get("/invoices/" + idFacturaCreada, tokenOperador());
        JsonNode factura = respuesta.json();

        assertThat(respuesta.codigo()).isEqualTo(200);
        assertThat(factura.path("id").asLong()).isEqualTo(idFacturaCreada);
        assertThat(factura.path("total").decimalValue()).isEqualByComparingTo(new BigDecimal("2380000"));
        // Total en letras del servicio SOAP legado: texto, o null si el servicio no respondió.
        assertThat(factura.has("totalInWords")).isTrue();
    }

    @Test
    @Order(6)
    @DisplayName("CP-R21 El AUDITOR no puede crear facturas: 403")
    void auditorNoPuedeCrear() {
        Map<String, Object> cuerpo = Map.of("customerName", "Intento del auditor", "type", 1, "subtotal", 100000);
        assertThat(api.post("/invoices", cuerpo, Sesiones.token(Usuarios.auditor())).codigo()).isEqualTo(403);
    }

    @Test
    @Order(7)
    @DisplayName("CP-R22 Crear una factura sin token devuelve 401")
    void crearSinToken() {
        Map<String, Object> cuerpo = Map.of("customerName", "Sin token", "type", 1, "subtotal", 100000);
        assertThat(api.post("/invoices", cuerpo, null).codigo()).isEqualTo(401);
    }

    /** "<150 caracteres>" se convierte en un nombre de exactamente 150 caracteres. */
    private static String expandirCliente(String cliente) {
        if (cliente != null && cliente.matches("<\\d+ caracteres>")) {
            int longitud = Integer.parseInt(cliente.replaceAll("\\D", ""));
            return "C".repeat(longitud);
        }
        return cliente == null ? "" : cliente;
    }
}
