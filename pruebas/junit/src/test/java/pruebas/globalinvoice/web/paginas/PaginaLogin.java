package pruebas.globalinvoice.web.paginas;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Page Object del formulario de inicio de sesión (/login).
 * Los localizadores usan formcontrolname y atributos de accesibilidad, no clases de estilo.
 */
public class PaginaLogin extends PaginaBase {

    public static final String RUTA = "/login";
    public static final By TARJETA = By.cssSelector("mat-card.login-card");

    private static final By USUARIO = By.cssSelector("input[formcontrolname='username']");
    private static final By CLAVE = By.cssSelector("input[formcontrolname='password']");
    private static final By INGRESAR = By.cssSelector("button[type='submit']");
    private static final By ALERTA = By.cssSelector(".login-error[role='alert']");
    private static final By ERRORES_CAMPO = By.cssSelector("mat-error");

    public PaginaLogin(WebDriver driver) {
        super(driver);
    }

    public PaginaLogin abrir() {
        visitar(RUTA);
        encontrar(USUARIO);
        return this;
    }

    public void iniciarSesion(String usuario, String clave) {
        escribir(USUARIO, usuario);
        escribir(CLAVE, clave);
        clic(INGRESAR);
    }

    public void enviarVacio() {
        clic(INGRESAR);
    }

    public String mensajeError() {
        return texto(ALERTA);
    }

    public List<String> erroresDeCampos() {
        return textosVisibles(ERRORES_CAMPO);
    }
}
