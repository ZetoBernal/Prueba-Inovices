package pruebas.globalinvoice.soporte;

import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

/**
 * Fábrica de WebDriver: el único lugar donde se decide qué navegador se usa
 * y con qué opciones.
 */
public final class FabricaDriver {

    private FabricaDriver() {
    }

    public static WebDriver crear() {
        ChromeOptions opciones = new ChromeOptions();
        opciones.addArguments("--window-size=1366,900", "--lang=es-CO", "--ignore-certificate-errors");
        // El front usa un certificado autofirmado (taller de Seguridad en Software).
        opciones.setAcceptInsecureCerts(true);

        if (Configuracion.headless()) {
            opciones.addArguments("--headless=new", "--disable-gpu");
        }
        Configuracion.chromeBin().ifPresent(opciones::setBinary);
        if (!Configuracion.chromeArgs().isEmpty()) {
            opciones.addArguments(Configuracion.chromeArgs());
        }
        // Con un chromedriver instalado se evita que Selenium Manager lo descargue.
        Configuracion.chromedriver().ifPresent(ruta -> System.setProperty("webdriver.chrome.driver", ruta));

        WebDriver driver = new ChromeDriver(opciones);
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        return driver;
    }
}
