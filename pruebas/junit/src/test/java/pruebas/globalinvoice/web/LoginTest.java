package pruebas.globalinvoice.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import pruebas.globalinvoice.soporte.Evidencias;
import pruebas.globalinvoice.soporte.Usuarios;
import pruebas.globalinvoice.soporte.Usuarios.Usuario;
import pruebas.globalinvoice.web.paginas.PaginaFacturas;
import pruebas.globalinvoice.web.paginas.PaginaLogin;

/**
 * Formulario de inicio de sesión: validaciones del cliente, credenciales incorrectas
 * y ciclo completo de sesión (iniciar, cerrar y perder el acceso a rutas protegidas).
 * Hace 2 peticiones de login reales (CP-J02 y CP-J03).
 */
@Order(1)
@DisplayName("Web: formulario de inicio de sesión")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LoginTest extends PruebaWebBase {

    private PaginaLogin login;

    @BeforeEach
    void abrirLoginSinSesion() {
        login = new PaginaLogin(driver);
        login.limpiarSesion();
        login.abrir();
    }

    @Test
    @Order(1)
    @DisplayName("CP-J01 Enviar el formulario vacío muestra los campos obligatorios")
    void formularioVacio() {
        login.enviarVacio();

        var errores = login.erroresDeCampos();
        Evidencias.capturar(driver, "CP-J01 login vacio", PaginaLogin.TARJETA);

        assertThat(errores).contains("El usuario es obligatorio", "La contraseña es obligatoria");
        assertThat(driver.getCurrentUrl()).contains(PaginaLogin.RUTA);
    }

    @Test
    @Order(2)
    @DisplayName("CP-J02 Credenciales incorrectas muestran un mensaje genérico y no crean sesión")
    void credencialesIncorrectas() {
        login.iniciarSesion(Usuarios.operador().usuario(), "ClaveErrada99");

        String mensaje = login.mensajeError();
        Evidencias.capturar(driver, "CP-J02 credenciales incorrectas", PaginaLogin.TARJETA);

        assertThat(mensaje).isEqualTo("Usuario o contraseña incorrectos.");
        assertThat(login.tokenDeSesion()).as("no debe guardarse ningún token").isNull();
    }

    @Test
    @Order(3)
    @DisplayName("CP-J03 El operador inicia sesión, la cierra y pierde el acceso a las rutas protegidas")
    void cicloDeSesionDelOperador() {
        Usuario operador = Usuarios.operador();
        login.iniciarSesion(operador.usuario(), operador.clave());

        PaginaFacturas facturas = new PaginaFacturas(driver).esperarCarga();
        Evidencias.capturar(driver, "CP-J03 sesion del operador iniciada");
        assertThat(facturas.usuarioEnBarra()).contains(operador.usuario()).contains(operador.rol());
        assertThat(facturas.tokenDeSesion()).as("JWT guardado").matches("[\\w-]+\\.[\\w-]+\\.[\\w-]+");
        assertThat(facturas.puedeCrearFacturas()).isTrue();

        facturas.cerrarSesion();
        login.esperarUrl(PaginaLogin.RUTA);
        assertThat(login.tokenDeSesion()).as("el token se elimina al cerrar sesión").isNull();

        // Sin sesión, entrar directo al listado debe devolver al login (authGuard).
        facturas.visitar(PaginaFacturas.RUTA);
        assertThat(facturas.esperarUrl(PaginaLogin.RUTA)).contains(PaginaLogin.RUTA);
        Evidencias.capturar(driver, "CP-J03 ruta protegida sin sesion", PaginaLogin.TARJETA);
    }
}
