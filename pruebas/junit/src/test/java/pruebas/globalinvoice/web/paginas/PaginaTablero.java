package pruebas.globalinvoice.web.paginas;

import java.util.LinkedHashMap;
import java.util.Map;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Page Object del tablero (/dashboard), disponible solo para el rol AUDITOR.
 */
public class PaginaTablero extends PaginaBase {

    public static final String RUTA = "/dashboard";

    private static final By TITULO = By.cssSelector("h1.page-title");
    private static final By CARGANDO = By.cssSelector("mat-progress-bar");
    private static final By KPI = By.cssSelector("mat-card.kpi");
    private static final By ETIQUETA_KPI = By.cssSelector(".kpi__label");
    private static final By VALOR_KPI = By.cssSelector(".kpi__value");

    public PaginaTablero(WebDriver driver) {
        super(driver);
    }

    public PaginaTablero esperarCarga() {
        esperarUrl(RUTA);
        encontrar(TITULO);
        esperarQueDesaparezca(CARGANDO);
        encontrar(KPI);
        return this;
    }

    /** Indicadores del tablero: etiqueta en mayúsculas → valor mostrado. */
    public Map<String, String> indicadores() {
        Map<String, String> valores = new LinkedHashMap<>();
        for (WebElement tarjeta : driver.findElements(KPI)) {
            String etiqueta = tarjeta.findElement(ETIQUETA_KPI).getText().trim();
            String valor = tarjeta.findElement(VALOR_KPI).getText().trim();
            valores.put(etiqueta, valor);
        }
        return valores;
    }
}
