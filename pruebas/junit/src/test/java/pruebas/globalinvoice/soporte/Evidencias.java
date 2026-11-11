package pruebas.globalinvoice.soporte;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Guarda capturas de pantalla numeradas en evidencias/selenium.
 * La carpeta se limpia al cargar la clase, para que las capturas correspondan
 * siempre a la última ejecución.
 */
public final class Evidencias {

    private static final Path CARPETA = Configuracion.evidencias().resolve("selenium");
    private static final AtomicInteger CONSECUTIVO = new AtomicInteger();

    static {
        try {
            Files.createDirectories(CARPETA);
            try (Stream<Path> archivos = Files.list(CARPETA)) {
                archivos.filter(p -> p.toString().endsWith(".png")).forEach(p -> p.toFile().delete());
            }
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo preparar la carpeta de evidencias", e);
        }
    }

    private Evidencias() {
    }

    /** Captura la ventana completa. */
    public static void capturar(WebDriver driver, String nombre) {
        guardar(driver, nombre, (TakesScreenshot) driver);
    }

    /** Captura solo un elemento (por ejemplo la tarjeta del formulario). */
    public static void capturar(WebDriver driver, String nombre, By elemento) {
        guardar(driver, nombre, driver.findElement(elemento));
    }

    private static void guardar(WebDriver driver, String nombre, TakesScreenshot objetivo) {
        String archivo = String.format("%02d-%s.png", CONSECUTIVO.incrementAndGet(), nombreSeguro(nombre));
        try {
            esperarAnimaciones(driver);
            Files.write(CARPETA.resolve(archivo), objetivo.getScreenshotAs(OutputType.BYTES));
        } catch (Exception e) {
            // Una captura fallida no debe tumbar la prueba: se registra y se sigue.
            System.err.println("No se pudo guardar la captura '" + nombre + "': " + e.getMessage());
        }
    }

    /** Espera a que terminen las animaciones de Angular Material antes de capturar. */
    private static void esperarAnimaciones(WebDriver driver) {
        try {
            new WebDriverWait(driver, Duration.ofSeconds(2)).until(d -> (Boolean) ((JavascriptExecutor) d)
                    .executeScript("return document.getAnimations().every(a => a.playState !== 'running');"));
        } catch (TimeoutException ignorada) {
            // Si alguna animación no termina a tiempo se captura igual.
        }
    }

    private static String nombreSeguro(String texto) {
        String sinTildes = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String limpio = sinTildes.replaceAll("[^a-zA-Z0-9-]+", "-").replaceAll("^-+|-+$", "").toLowerCase(Locale.ROOT);
        return limpio.length() > 80 ? limpio.substring(0, 80) : limpio;
    }
}
