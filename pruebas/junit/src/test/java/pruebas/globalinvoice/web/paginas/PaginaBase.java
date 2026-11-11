package pruebas.globalinvoice.web.paginas;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import pruebas.globalinvoice.soporte.Configuracion;

/**
 * Comportamiento común a todas las páginas (Page Object Model).
 * Centraliza las esperas explícitas para que ninguna prueba use pausas fijas.
 */
public abstract class PaginaBase {

    protected final WebDriver driver;
    protected final WebDriverWait espera;

    protected PaginaBase(WebDriver driver) {
        this.driver = driver;
        this.espera = new WebDriverWait(driver, Configuracion.timeout());
    }

    /** Navega a una ruta relativa del front, por ejemplo "/login". */
    public void visitar(String ruta) {
        driver.get(Configuracion.baseUrl() + ruta);
    }

    /** Borra la sesión que la app guarda en localStorage (token JWT y usuario). */
    public void limpiarSesion() {
        visitar("/login");
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
    }

    /** Devuelve el token JWT que la app guardó al iniciar sesión, o null si no hay sesión. */
    public String tokenDeSesion() {
        return (String) ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('gi_token');");
    }

    /** Espera hasta que la URL contenga el fragmento indicado y la devuelve. */
    public String esperarUrl(String fragmento) {
        espera.withMessage("La URL no llegó a contener " + fragmento)
                .until(ExpectedConditions.urlContains(fragmento));
        return driver.getCurrentUrl();
    }

    /** Espera a que el elemento sea visible y lo devuelve. */
    protected WebElement encontrar(By localizador) {
        return espera.withMessage("No apareció el elemento " + localizador)
                .until(ExpectedConditions.visibilityOfElementLocated(localizador));
    }

    /**
     * Escribe en un campo reemplazando su valor. clear() no dispara los eventos que
     * escucha Angular, por eso se selecciona todo y se borra con el teclado.
     */
    protected void escribir(By localizador, String texto) {
        WebElement campo = encontrar(localizador);
        campo.click();
        campo.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
        if (texto != null && !texto.isEmpty()) {
            campo.sendKeys(texto);
        }
    }

    protected void clic(By localizador) {
        espera.withMessage("No se pudo hacer clic en " + localizador)
                .until(ExpectedConditions.elementToBeClickable(localizador))
                .click();
    }

    protected String texto(By localizador) {
        return encontrar(localizador).getText().trim();
    }

    /** Textos de todos los elementos visibles que coinciden con el localizador. */
    protected List<String> textosVisibles(By localizador) {
        encontrar(localizador);
        return driver.findElements(localizador).stream()
                .filter(WebElement::isDisplayed)
                .map(e -> e.getText().trim())
                .toList();
    }

    /** true si el elemento está presente y visible en este momento, sin esperar. */
    protected boolean estaVisible(By localizador) {
        List<WebElement> elementos = driver.findElements(localizador);
        return !elementos.isEmpty() && elementos.get(0).isDisplayed();
    }

    protected void esperarQueDesaparezca(By localizador) {
        espera.withMessage("El elemento " + localizador + " no desapareció")
                .until(ExpectedConditions.numberOfElementsToBe(localizador, 0));
    }
}
