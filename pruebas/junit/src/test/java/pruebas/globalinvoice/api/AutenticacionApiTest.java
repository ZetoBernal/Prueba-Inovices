package pruebas.globalinvoice.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import pruebas.globalinvoice.soporte.Fechas;
import pruebas.globalinvoice.soporte.Usuarios;
import pruebas.globalinvoice.soporte.Usuarios.Usuario;

/**
 * Endpoints de autenticación: POST /auth/login y GET /auth/me.
 * Hace 4 logins (dos válidos, uno con clave errada y uno sin datos) y deja los tokens
 * válidos en la caché de Sesiones para que las demás clases no vuelvan a iniciar sesión.
 */
@Tag("api")
@Order(11)
@DisplayName("API: autenticación")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AutenticacionApiTest {

    private final ClienteApi api = new ClienteApi();

    @Test
    @Order(1)
    @DisplayName("CP-R01 Login del OPERADOR devuelve 200, un JWT y el rol")
    void loginOperador() {
        Usuario operador = Usuarios.operador();
        ClienteApi.Respuesta respuesta = api.login(operador.usuario(), operador.clave());
        JsonNode cuerpo = respuesta.json();

        assertThat(respuesta.codigo()).isEqualTo(200);
        assertThat(cuerpo.path("token").asText()).matches("[\\w-]+\\.[\\w-]+\\.[\\w-]+");
        assertThat(cuerpo.path("role").asText()).isEqualTo(operador.rol());
        assertThat(Fechas.parsear(cuerpo.path("expiresAt").asText())).isAfter(OffsetDateTime.now());

        Sesiones.registrar(operador, cuerpo.path("token").asText());
    }

    @Test
    @Order(2)
    @DisplayName("CP-R02 Login del AUDITOR devuelve 200 y el rol AUDITOR")
    void loginAuditor() {
        Usuario auditor = Usuarios.auditor();
        ClienteApi.Respuesta respuesta = api.login(auditor.usuario(), auditor.clave());

        assertThat(respuesta.codigo()).isEqualTo(200);
        assertThat(respuesta.json().path("role").asText()).isEqualTo(auditor.rol());

        Sesiones.registrar(auditor, respuesta.json().path("token").asText());
    }

    @Test
    @Order(3)
    @DisplayName("CP-R03 Contraseña incorrecta devuelve 401 con un mensaje genérico y sin token")
    void claveIncorrecta() {
        ClienteApi.Respuesta respuesta = api.login(Usuarios.operador().usuario(), "ClaveErrada99");

        assertThat(respuesta.codigo()).isEqualTo(401);
        assertThat(respuesta.json().path("message").asText()).isEqualTo("Usuario o contraseña incorrectos.");
        assertThat(respuesta.json().has("token")).isFalse();
    }

    @Test
    @Order(4)
    @DisplayName("CP-R04 Login sin datos devuelve 400 con errores en usuario y contraseña")
    void loginSinDatos() {
        ClienteApi.Respuesta respuesta = api.post("/auth/login", Map.of(), null);

        assertThat(respuesta.codigo()).isEqualTo(400);
        assertThat(camposConError(respuesta.json())).contains("username", "password");
    }

    @Test
    @Order(5)
    @DisplayName("CP-R05 GET /auth/me con token identifica al usuario de la sesión")
    void sesionConToken() {
        ClienteApi.Respuesta respuesta = api.get("/auth/me", Sesiones.token(Usuarios.operador()));

        assertThat(respuesta.codigo()).isEqualTo(200);
        assertThat(respuesta.json().path("username").asText()).isEqualTo(Usuarios.operador().usuario());
        assertThat(respuesta.json().path("role").asText()).isEqualTo(Usuarios.operador().rol());
    }

    @Test
    @Order(6)
    @DisplayName("CP-R06 GET /auth/me sin token devuelve 401 con el esquema Bearer")
    void sesionSinToken() {
        ClienteApi.Respuesta respuesta = api.get("/auth/me", null);

        assertThat(respuesta.codigo()).isEqualTo(401);
        assertThat(respuesta.cabeceras().getFirst("WWW-Authenticate")).contains("Bearer");
    }

    @Test
    @Order(7)
    @DisplayName("CP-R07 Un token con la firma alterada devuelve 401")
    void tokenManipulado() {
        String token = Sesiones.token(Usuarios.operador());
        String[] partes = token.split("\\.");
        String firmaAlterada = new StringBuilder(partes[2]).reverse().toString();
        String manipulado = partes[0] + "." + partes[1] + "." + firmaAlterada;

        assertThat(api.get("/auth/me", manipulado).codigo()).isEqualTo(401);
    }

    /** Nombres de los campos con error en un ProblemDetails, en minúsculas. */
    static List<String> camposConError(JsonNode problema) {
        List<String> campos = new ArrayList<>();
        problema.path("errors").fieldNames().forEachRemaining(campo -> campos.add(campo.toLowerCase()));
        return campos;
    }
}
