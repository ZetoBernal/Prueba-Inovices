/**
 * Page Object del listado de facturas (/invoices) y de la barra superior.
 */
const { BasePage, By } = require('./BasePage');

class FacturasPage extends BasePage {
    static ruta = '/invoices';

    localizadores = {
        titulo: By.css('.header h1'),
        botonNueva: By.css('a[href$="/invoices/new"]'),
        filas: By.css('tr.mat-mdc-row'),
        cargando: By.css('mat-progress-bar'),
        usuarioActual: By.css('mat-toolbar .user'),
        cerrarSesion: By.css('button[aria-label="Cerrar sesión"]')
    };

    /** Espera a que el listado termine de cargar y tenga filas. */
    async esperarCarga() {
        await this.esperarUrl(FacturasPage.ruta);
        await this.encontrar(this.localizadores.titulo);
        await this.esperarQueDesaparezca(this.localizadores.cargando);
        await this.encontrar(this.localizadores.filas);
    }

    async cantidadFilas() {
        return (await this.driver.findElements(this.localizadores.filas)).length;
    }

    async usuarioEnBarra() {
        return this.texto(this.localizadores.usuarioActual);
    }

    async puedeCrearFacturas() {
        return this.estaVisible(this.localizadores.botonNueva);
    }

    async irANuevaFactura() {
        await this.clic(this.localizadores.botonNueva);
    }

    /**
     * Busca la fila de un cliente y devuelve sus celdas como objeto.
     * Columnas de la tabla: N°, Cliente, Tipo, Subtotal, Total.
     */
    async filaDeCliente(cliente) {
        const xpath = By.xpath(`//tr[contains(@class,'mat-mdc-row')][td[normalize-space(.)='${cliente}']]`);
        const fila = await this.encontrar(xpath);
        const celdas = await fila.findElements(By.css('td'));
        const valores = [];
        for (const celda of celdas) valores.push((await celda.getText()).trim());
        const [numero, nombre, tipo, subtotal, total] = valores;
        return { numero, cliente: nombre, tipo, subtotal, total };
    }

    async cerrarSesion() {
        await this.clic(this.localizadores.cerrarSesion);
    }
}

module.exports = { FacturasPage };
