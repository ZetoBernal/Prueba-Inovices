package pruebas.globalinvoice.web;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;
import pruebas.globalinvoice.soporte.CapturaEnFallo;
import pruebas.globalinvoice.soporte.FabricaDriver;

/**
 * Base de las pruebas web: abre un navegador por clase de prueba, lo cierra al final
 * y registra la extensión que captura la pantalla cuando una prueba falla.
 *
 * El backend admite 5 inicios de sesión por minuto por IP, así que cada clase inicia
 * sesión lo menos posible: entre las tres clases web hay solo 4 logins.
 */
@Tag("web")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(CapturaEnFallo.class)
public abstract class PruebaWebBase {

    protected WebDriver driver;

    @BeforeAll
    void abrirNavegador() {
        driver = FabricaDriver.crear();
    }

    @AfterAll
    void cerrarNavegador() {
        if (driver != null) {
            driver.quit();
        }
    }

    public WebDriver driver() {
        return driver;
    }
}
