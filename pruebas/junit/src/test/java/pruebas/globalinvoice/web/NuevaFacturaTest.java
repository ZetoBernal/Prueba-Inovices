package pruebas.globalinvoice.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import pruebas.globalinvoice.soporte.Evidencias;
import pruebas.globalinvoice.soporte.ReglasNegocio;
import pruebas.globalinvoice.soporte.Usuarios;
import pruebas.globalinvoice.soporte.Usuarios.Usuario;
import pruebas.globalinvoice.web.paginas.PaginaFacturas;
import pruebas.globalinvoice.web.paginas.PaginaLogin;
import pruebas.globalinvoice.web.paginas.PaginaNuevaFactura;

/**
 * Formulario "Nueva factura": inicia sesión una sola vez como OPERADOR, prueba las
 * validaciones y crea facturas de los tres tipos desde datos/facturas-web.csv,
 * comparando el total mostrado con el oráculo de reglas de negocio.
 */
@Order(2)
@DisplayName("Web: formulario de nueva factura")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class NuevaFacturaTest extends PruebaWebBase {

    /** Sufijo por ejecución para que cada cliente creado sea único en el listado. */
    private static final String SUFIJO = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));

    private PaginaNuevaFactura formulario;

    @BeforeAll
    void iniciarSesionComoOperador() {
        Usuario operador = Usuarios.operador();
        PaginaLogin login = new PaginaLogin(driver);
        login.limpiarSesion();
        login.abrir().iniciarSesion(operador.usuario(), operador.clave());
        login.esperarUrl(operador.inicio());
    }

    @BeforeEach
    void abrirFormulario() {
        formulario = new PaginaNuevaFactura(driver).abrir();
    }

    @Test
    @Order(1)
    @DisplayName("CP-J04 Guardar el formulario vacío marca cliente, tipo y subtotal como obligatorios")
    void formularioVacio() {
        formulario.guardar();

        var errores = formulario.erroresDeCampos();
        Evidencias.capturar(driver, "CP-J04 factura vacia", PaginaNuevaFactura.TARJETA);

        assertThat(errores).contains("El cliente es obligatorio", "Selecciona un tipo de factura",
                "El subtotal es obligatorio");
        assertThat(driver.getCurrentUrl()).contains(PaginaNuevaFactura.RUTA);
    }

    @Test
    @Order(2)
    @DisplayName("CP-J05 El código aduanero aparece solo en exportación y es obligatorio")
    void codigoAduaneroCondicional() {
        assertThat(formulario.muestraCodigoAduanero()).as("oculto al inicio").isFalse();

        formulario.diligenciar("Cliente exportación", "Exportación", "1000000", null);
        assertThat(formulario.muestraCodigoAduanero()).as("visible en exportación").isTrue();

        formulario.guardar();
        var errores = formulario.erroresDeCampos();
        Evidencias.capturar(driver, "CP-J05 exportacion sin codigo aduanero", PaginaNuevaFactura.TARJETA);
        assertThat(errores).contains("Obligatorio para facturas de exportación");

        formulario.seleccionarTipo("Nacional");
        assertThat(formulario.muestraCodigoAduanero()).as("se oculta al cambiar de tipo").isFalse();
    }

    @Order(3)
    @ParameterizedTest(name = "{0} Crear {1}")
    @CsvFileSource(resources = "/datos/facturas-web.csv", numLinesToSkip = 1)
    void crearFactura(String caso, String descripcion, String cliente, String tipo, String tipoEnTabla,
                      long subtotal, String codigoAduanero) {
        String clienteUnico = cliente + " " + SUFIJO;
        formulario.diligenciar(clienteUnico, tipo, String.valueOf(subtotal), codigoAduanero);
        Evidencias.capturar(driver, caso + " formulario diligenciado", PaginaNuevaFactura.TARJETA);
        formulario.guardar();

        PaginaFacturas listado = new PaginaFacturas(driver).esperarCarga();
        PaginaFacturas.Fila fila = listado.filaDeCliente(clienteUnico);
        Evidencias.capturar(driver, caso + " factura en el listado");

        BigDecimal totalEsperado = ReglasNegocio
                .calcular(ReglasNegocio.tipoDesdeNombre(tipoEnTabla), BigDecimal.valueOf(subtotal))
                .total();
        assertThat(fila.numero()).matches("FAC-\\d{5}");
        assertThat(fila.tipo()).isEqualTo(tipoEnTabla);
        assertThat(ReglasNegocio.aNumero(fila.subtotal())).isEqualByComparingTo(BigDecimal.valueOf(subtotal));
        assertThat(ReglasNegocio.aNumero(fila.total())).as("total según el oráculo").isEqualByComparingTo(totalEsperado);
    }
}
