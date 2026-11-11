package pruebas.globalinvoice.api;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import pruebas.globalinvoice.soporte.Usuarios.Usuario;

/**
 * Caché de tokens JWT por usuario durante toda la ejecución.
 * El backend admite solo 5 inicios de sesión por minuto por IP, así que cada usuario
 * inicia sesión una sola vez y las demás pruebas reutilizan su token.
 */
public final class Sesiones {

    private static final Map<String, String> TOKENS = new ConcurrentHashMap<>();
    private static final ClienteApi API = new ClienteApi();

    private Sesiones() {
    }

    /** Guarda un token obtenido por una prueba de login, para no volver a pedirlo. */
    public static void registrar(Usuario usuario, String token) {
        TOKENS.put(usuario.usuario(), token);
    }

    /** Devuelve el token del usuario; inicia sesión solo si todavía no hay uno. */
    public static String token(Usuario usuario) {
        return TOKENS.computeIfAbsent(usuario.usuario(), clave -> {
            ClienteApi.Respuesta respuesta = API.login(usuario.usuario(), usuario.clave());
            if (respuesta.codigo() != 200) {
                throw new IllegalStateException("No se pudo iniciar sesión como " + clave
                        + " (código " + respuesta.codigo() + ")");
            }
            return respuesta.json().path("token").asText();
        });
    }
}
