/**
 * Page Object del formulario de inicio de sesión (/login).
 * Los localizadores usan el atributo formcontrolname de los formularios
 * reactivos de Angular: no dependen de estilos ni del texto visible.
 */
const { BasePage, By } = require('./BasePage');

class LoginPage extends BasePage {
    static ruta = '/login';

    localizadores = {
        usuario: By.css('input[formcontrolname="username"]'),
        clave: By.css('input[formcontrolname="password"]'),
        ingresar: By.css('button[type="submit"]'),
        verClave: By.css('button[aria-label$="contraseña"]'),
        alertaError: By.css('.login-error[role="alert"]'),
        erroresCampo: By.css('mat-error'),
        titulo: By.css('mat-card-title'),
        tarjeta: By.css('mat-card.login-card')
    };

    async abrir() {
        await this.visitar(LoginPage.ruta);
        await this.encontrar(this.localizadores.usuario);
    }

    /** Diligencia el formulario y lo envía. */
    async iniciarSesion(usuario, clave) {
        await this.escribir(this.localizadores.usuario, usuario);
        await this.escribir(this.localizadores.clave, clave);
        await this.clic(this.localizadores.ingresar);
    }

    async enviarVacio() {
        await this.clic(this.localizadores.ingresar);
    }

    async mensajeError() {
        return this.texto(this.localizadores.alertaError);
    }

    async erroresDeCampos() {
        await this.encontrar(this.localizadores.erroresCampo);
        return this.textos(this.localizadores.erroresCampo);
    }

    async alternarVisibilidadClave() {
        await this.clic(this.localizadores.verClave);
    }

    async tipoCampoClave() {
        return (await this.encontrar(this.localizadores.clave)).getAttribute('type');
    }
}

module.exports = { LoginPage };
