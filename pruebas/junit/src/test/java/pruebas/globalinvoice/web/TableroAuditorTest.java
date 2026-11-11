package pruebas.globalinvoice.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import pruebas.globalinvoice.api.ClienteApi;
import pruebas.globalinvoice.soporte.Evidencias;
import pruebas.globalinvoice.soporte.ReglasNegocio;
import pruebas.globalinvoice.soporte.Usuarios;
import pruebas.globalinvoice.soporte.Usuarios.Usuario;
import pruebas.globalinvoice.web.paginas.PaginaFacturas;
import pruebas.globalinvoice.web.paginas.PaginaLogin;
import pruebas.globalinvoice.web.paginas.PaginaTablero;

/**
 * Tablero del AUDITOR: control de acceso por rol y una prueba de integración que
 * compara los indicadores que muestra la interfaz con los datos que entrega la API.
 * Para consultar la API reutiliza el token de la sesión del navegador (sin otro login).
 */
@Order(3)
@DisplayName("Web: tablero del auditor")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TableroAuditorTest extends PruebaWebBase {

    private PaginaTablero tablero;

    @BeforeAll
    void iniciarSesionComoAuditor() {
        Usuario auditor = Usuarios.auditor();
        PaginaLogin login = new PaginaLogin(driver);
        login.limpiarSesion();
        login.abrir().iniciarSesion(auditor.usuario(), auditor.clave());
        tablero = new PaginaTablero(driver);
        tablero.esperarUrl(auditor.inicio());
    }

    @Test
    @Order(1)
    @DisplayName("CP-J09 El auditor llega al tablero y no puede entrar a crear facturas")
    void accesoSegunRol() {
        tablero.esperarCarga();
        PaginaFacturas barra = new PaginaFacturas(driver);
        Evidencias.capturar(driver, "CP-J09 tablero del auditor");
        assertThat(barra.usuarioEnBarra()).contains(Usuarios.auditor().rol());

        // La guarda de rol devuelve al auditor a su inicio si intenta crear una factura.
        tablero.visitar("/invoices/new");
        assertThat(tablero.esperarUrl(PaginaTablero.RUTA)).doesNotContain("/invoices/new");

        barra.visitar(PaginaFacturas.RUTA);
        barra.esperarCarga();
        assertThat(barra.puedeCrearFacturas()).as("el auditor no ve el botón Nueva factura").isFalse();
        Evidencias.capturar(driver, "CP-J09 listado sin boton de nueva factura");
    }

    @Test
    @Order(2)
    @DisplayName("CP-J10 Los indicadores del tablero coinciden con los datos de la API")
    void indicadoresCoincidenConLaApi() {
        tablero.visitar(PaginaTablero.RUTA);
        Map<String, String> indicadores = tablero.esperarCarga().indicadores();
        Evidencias.capturar(driver, "CP-J10 indicadores del tablero");

        ClienteApi.Respuesta respuesta = new ClienteApi().get("/invoices", tablero.tokenDeSesion());
        assertThat(respuesta.codigo()).isEqualTo(200);

        JsonNode facturas = respuesta.json();
        BigDecimal total = BigDecimal.ZERO;
        for (JsonNode factura : facturas) {
            total = total.add(factura.path("total").decimalValue());
        }
        int cantidad = facturas.size();
        BigDecimal promedio = total.divide(BigDecimal.valueOf(cantidad), 0, RoundingMode.HALF_UP);

        assertThat(ReglasNegocio.aNumero(indicadores.get("TOTAL FACTURADO"))).isEqualByComparingTo(total);
        assertThat(ReglasNegocio.aNumero(indicadores.get("N° DE FACTURAS"))).isEqualByComparingTo(BigDecimal.valueOf(cantidad));
        // El front redondea el promedio al mostrarlo; se admite una diferencia de 1 peso.
        assertThat(ReglasNegocio.aNumero(indicadores.get("TICKET PROMEDIO")).subtract(promedio).abs())
                .isLessThanOrEqualTo(BigDecimal.ONE);
    }
}
