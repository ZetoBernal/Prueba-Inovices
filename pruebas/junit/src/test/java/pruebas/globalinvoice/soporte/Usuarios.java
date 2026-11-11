package pruebas.globalinvoice.soporte;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Properties;

/**
 * Usuarios de prueba leídos de datos/usuarios.properties, para no dejar
 * credenciales escritas dentro de las pruebas.
 */
public final class Usuarios {

    /** Datos de un usuario sembrado por el backend. */
    public record Usuario(String usuario, String clave, String rol, String inicio) {
    }

    private static final Properties DATOS = cargar();

    private Usuarios() {
    }

    public static Usuario operador() {
        return leer("operador");
    }

    public static Usuario auditor() {
        return leer("auditor");
    }

    private static Usuario leer(String clave) {
        return new Usuario(
                DATOS.getProperty(clave + ".usuario"),
                DATOS.getProperty(clave + ".clave"),
                DATOS.getProperty(clave + ".rol"),
                DATOS.getProperty(clave + ".inicio"));
    }

    private static Properties cargar() {
        try (InputStream entrada = Usuarios.class.getResourceAsStream("/datos/usuarios.properties")) {
            if (entrada == null) {
                throw new IllegalStateException("No se encontró datos/usuarios.properties");
            }
            Properties propiedades = new Properties();
            propiedades.load(entrada);
            return propiedades;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
