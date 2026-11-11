package pruebas.globalinvoice.web.paginas;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Page Object del listado de facturas (/invoices) y de la barra superior.
 */
public class PaginaFacturas extends PaginaBase {

    public static final String RUTA = "/invoices";

    private static final By TITULO = By.cssSelector(".header h1");
    private static final By BOTON_NUEVA = By.cssSelector("a[href$='/invoices/new']");
    private static final By FILAS = By.cssSelector("tr.mat-mdc-row");
    private static final By CARGANDO = By.cssSelector("mat-progress-bar");
    private static final By USUARIO_ACTUAL = By.cssSelector("mat-toolbar .user");
    private static final By CERRAR_SESION = By.cssSelector("button[aria-label='Cerrar sesión']");

    /** Una fila del listado. Columnas: N°, Cliente, Tipo, Subtotal, Total. */
    public record Fila(String numero, String cliente, String tipo, String subtotal, String total) {
    }

    public PaginaFacturas(WebDriver driver) {
        super(driver);
    }

    public PaginaFacturas esperarCarga() {
        esperarUrl(RUTA);
        encontrar(TITULO);
        esperarQueDesaparezca(CARGANDO);
        encontrar(FILAS);
        return this;
    }

    public int cantidadFilas() {
        return driver.findElements(FILAS).size();
    }

    public String usuarioEnBarra() {
        return texto(USUARIO_ACTUAL);
    }

    public boolean puedeCrearFacturas() {
        return estaVisible(BOTON_NUEVA);
    }

    public void irANuevaFactura() {
        clic(BOTON_NUEVA);
    }

    public void cerrarSesion() {
        clic(CERRAR_SESION);
    }

    public Fila filaDeCliente(String cliente) {
        By fila = By.xpath("//tr[contains(@class,'mat-mdc-row')][td[normalize-space(.)='" + cliente + "']]");
        List<String> celdas = encontrar(fila).findElements(By.cssSelector("td")).stream()
                .map(WebElement::getText)
                .map(String::trim)
                .toList();
        return new Fila(celdas.get(0), celdas.get(1), celdas.get(2), celdas.get(3), celdas.get(4));
    }
}
