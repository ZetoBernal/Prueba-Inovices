package pruebas.globalinvoice.soporte;

import java.nio.file.Path;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Configuración centralizada de las pruebas.
 * Cada valor se lee primero como propiedad del sistema (-Dclave=valor), luego como
 * variable de entorno, y si no existe se usa un valor por defecto pensado para el
 * entorno local del proyecto.
 */
public final class Configuracion {

    private Configuracion() {
    }

    private static Optional<String> leer(String propiedad, String variable) {
        String valor = System.getProperty(propiedad);
        if (valor == null || valor.isBlank()) {
            valor = System.getenv(variable);
        }
        return Optional.ofNullable(valor).filter(v -> !v.isBlank());
    }

    /** URL del front Angular, sin barra final. */
    public static String baseUrl() {
        return leer("baseUrl", "BASE_URL").orElse("https://localhost:4200").replaceAll("/+$", "");
    }

    /** URL base de la API REST, sin barra final (incluye el prefijo /api). */
    public static String apiUrl() {
        return leer("apiUrl", "API_URL").orElse("http://localhost:5273/api").replaceAll("/+$", "");
    }

    /** HEADLESS=false abre el navegador visible. */
    public static boolean headless() {
        return !leer("headless", "HEADLESS").map("false"::equalsIgnoreCase).orElse(false);
    }

    /** Espera explícita máxima por elemento. */
    public static Duration timeout() {
        return Duration.ofSeconds(leer("timeout", "TIMEOUT_SEGUNDOS").map(Long::parseLong).orElse(10L));
    }

    /** Ejecutable de Chrome/Chromium alternativo (por ejemplo en Docker). */
    public static Optional<String> chromeBin() {
        return leer("chromeBin", "CHROME_BIN");
    }

    /** Ruta de un chromedriver ya instalado; si no se indica, Selenium Manager lo descarga. */
    public static Optional<String> chromedriver() {
        return leer("chromedriver", "CHROMEDRIVER_PATH");
    }

    /** Argumentos extra de Chrome separados por espacios (por ejemplo "--no-sandbox"). */
    public static List<String> chromeArgs() {
        return leer("chromeArgs", "CHROME_ARGS")
                .map(v -> Arrays.stream(v.trim().split("\\s+")).toList())
                .orElse(List.of());
    }

    /** Carpeta de evidencias de la actividad (capturas, reportes y salida de consola). */
    public static Path evidencias() {
        return Path.of(leer("evidencias", "EVIDENCIAS_DIR").orElse("../evidencias")).toAbsolutePath().normalize();
    }
}
