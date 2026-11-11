/**
 * Page Object del formulario "Nueva factura" (/invoices/new).
 * Incluye el manejo del mat-select de Angular Material, que no es un
 * <select> nativo y requiere abrir el panel y elegir la opción.
 */
const { BasePage, By } = require('./BasePage');

class NuevaFacturaPage extends BasePage {
    static ruta = '/invoices/new';

    localizadores = {
        titulo: By.css('h1.page-title'),
        tarjeta: By.css('mat-card.form-card'),
        cliente: By.css('input[formcontrolname="customerName"]'),
        tipo: By.css('mat-select[formcontrolname="type"]'),
        subtotal: By.css('input[formcontrolname="subtotal"]'),
        codigoAduanero: By.css('input[formcontrolname="customsCode"]'),
        guardar: By.css('button[type="submit"]'),
        cancelar: By.xpath("//button[normalize-space(.)='Cancelar']"),
        erroresCampo: By.css('mat-error'),
        alertaError: By.css('p.error[role="alert"]'),
        opcion: etiqueta => By.xpath(`//mat-option[normalize-space(.)='${etiqueta}']`)
    };

    async abrir() {
        await this.visitar(NuevaFacturaPage.ruta);
        await this.esperarFormulario();
    }

    async esperarFormulario() {
        await this.esperarUrl(NuevaFacturaPage.ruta);
        await this.encontrar(this.localizadores.cliente);
    }

    async seleccionarTipo(etiqueta) {
        await this.clic(this.localizadores.tipo);
        await this.clic(this.localizadores.opcion(etiqueta));
        // Esperar a que el panel se cierre antes de seguir escribiendo.
        await this.esperarQueDesaparezca(By.css('.mat-mdc-select-panel'));
    }

    /**
     * Diligencia el formulario a partir de un objeto de datos de prueba.
     * @param {{cliente?: string, tipo?: string, subtotal?: number|string, codigoAduanero?: string}} factura
     */
    async diligenciar(factura) {
        if (factura.cliente !== undefined) await this.escribir(this.localizadores.cliente, factura.cliente);
        if (factura.tipo) await this.seleccionarTipo(factura.tipo);
        if (factura.subtotal !== undefined) await this.escribir(this.localizadores.subtotal, factura.subtotal);
        if (factura.codigoAduanero) await this.escribir(this.localizadores.codigoAduanero, factura.codigoAduanero);
    }

    async guardar() {
        await this.clic(this.localizadores.guardar);
    }

    async cancelar() {
        await this.clic(this.localizadores.cancelar);
    }

    async erroresDeCampos() {
        await this.encontrar(this.localizadores.erroresCampo);
        return this.textos(this.localizadores.erroresCampo);
    }

    async muestraCodigoAduanero() {
        return this.estaVisible(this.localizadores.codigoAduanero);
    }
}

module.exports = { NuevaFacturaPage };
