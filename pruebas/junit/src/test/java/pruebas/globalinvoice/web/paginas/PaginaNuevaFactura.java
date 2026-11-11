package pruebas.globalinvoice.web.paginas;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Page Object del formulario "Nueva factura" (/invoices/new).
 * El tipo de factura es un mat-select de Angular Material: no es un select nativo,
 * hay que abrir el panel, elegir la opción y esperar a que se cierre.
 */
public class PaginaNuevaFactura extends PaginaBase {

    public static final String RUTA = "/invoices/new";
    public static final By TARJETA = By.cssSelector("mat-card.form-card");

    private static final By CLIENTE = By.cssSelector("input[formcontrolname='customerName']");
    private static final By TIPO = By.cssSelector("mat-select[formcontrolname='type']");
    private static final By PANEL_TIPO = By.cssSelector(".mat-mdc-select-panel");
    private static final By SUBTOTAL = By.cssSelector("input[formcontrolname='subtotal']");
    private static final By CODIGO_ADUANERO = By.cssSelector("input[formcontrolname='customsCode']");
    private static final By GUARDAR = By.cssSelector("button[type='submit']");
    private static final By ERRORES_CAMPO = By.cssSelector("mat-error");

    public PaginaNuevaFactura(WebDriver driver) {
        super(driver);
    }

    public PaginaNuevaFactura abrir() {
        visitar(RUTA);
        esperarUrl(RUTA);
        encontrar(CLIENTE);
        return this;
    }

    public void seleccionarTipo(String etiqueta) {
        clic(TIPO);
        clic(By.xpath("//mat-option[normalize-space(.)='" + etiqueta + "']"));
        esperarQueDesaparezca(PANEL_TIPO);
    }

    /**
     * Diligencia el formulario. Los parámetros null o vacíos se omiten.
     *
     * @param tipo etiqueta visible de la opción: Nacional, Exportación o Gubernamental
     */
    public void diligenciar(String cliente, String tipo, String subtotal, String codigoAduanero) {
        if (cliente != null) {
            escribir(CLIENTE, cliente);
        }
        if (tipo != null && !tipo.isBlank()) {
            seleccionarTipo(tipo);
        }
        if (subtotal != null) {
            escribir(SUBTOTAL, subtotal);
        }
        if (codigoAduanero != null && !codigoAduanero.isBlank()) {
            escribir(CODIGO_ADUANERO, codigoAduanero);
        }
    }

    public void guardar() {
        clic(GUARDAR);
    }

    public List<String> erroresDeCampos() {
        return textosVisibles(ERRORES_CAMPO);
    }

    public boolean muestraCodigoAduanero() {
        return estaVisible(CODIGO_ADUANERO);
    }
}
