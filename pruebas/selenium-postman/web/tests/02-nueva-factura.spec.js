/**
 * Suite 2 - Formulario "Nueva factura".
 * Inicia sesión una sola vez como OPERADOR y prueba las validaciones del
 * formulario, el campo condicional de exportación y la creación de facturas
 * de los tres tipos, verificando el total calculado contra las reglas de negocio.
 */
const { expect } = require('chai');
const { usarNavegador } = require('../support/hooks');
const { capturar } = require('../support/evidencias');
const { calcularTotal, aNumero } = require('../support/reglas-negocio');
const { LoginPage } = require('../pages/LoginPage');
const { FacturasPage } = require('../pages/FacturasPage');
const { NuevaFacturaPage } = require('../pages/NuevaFacturaPage');
const datos = require('../datos/facturas.json');
const usuarios = require('../datos/usuarios.json');

// Sufijo por ejecución para que cada cliente creado sea único en el listado.
const SUFIJO = new Date().toISOString().slice(11, 19).replace(/:/g, '');
const operador = usuarios.validos.find(u => u.rol === 'OPERADOR');
const msg = datos.mensajes;

describe('Formulario de nueva factura', function () {
    const sesion = usarNavegador();
    let formulario;
    let listado;

    before(async function () {
        const login = new LoginPage(sesion.driver);
        await login.limpiarSesion();
        await login.abrir();
        await login.iniciarSesion(operador.usuario, operador.clave);
        await login.esperarUrl(operador.rutaInicio);
    });

    beforeEach(async function () {
        formulario = new NuevaFacturaPage(sesion.driver);
        listado = new FacturasPage(sesion.driver);
        await formulario.abrir();
    });

    it('CP-W07 marca como obligatorios cliente, tipo y subtotal', async function () {
        await formulario.guardar();

        const errores = await formulario.erroresDeCampos();
        await capturar(sesion.driver, 'CP-W07 factura campos obligatorios', this, formulario.localizadores.tarjeta);

        expect(errores).to.include.members([msg.clienteObligatorio, msg.tipoObligatorio, msg.subtotalObligatorio]);
        expect(await sesion.driver.getCurrentUrl()).to.contain(NuevaFacturaPage.ruta);
    });

    it('CP-W08 no acepta un subtotal igual a cero', async function () {
        await formulario.diligenciar({ cliente: 'Cliente subtotal cero', tipo: 'Nacional', subtotal: 0 });
        await formulario.guardar();

        const errores = await formulario.erroresDeCampos();
        await capturar(sesion.driver, 'CP-W08 factura subtotal cero', this, formulario.localizadores.tarjeta);

        expect(errores).to.include(msg.subtotalMayorQueCero);
        expect(await sesion.driver.getCurrentUrl()).to.contain(NuevaFacturaPage.ruta);
    });

    it('CP-W09 exige código aduanero solo para facturas de exportación', async function () {
        expect(await formulario.muestraCodigoAduanero(), 'oculto al inicio').to.equal(false);

        await formulario.diligenciar({ cliente: 'Cliente exportación', tipo: 'Exportación', subtotal: 1000000 });
        expect(await formulario.muestraCodigoAduanero(), 'visible para exportación').to.equal(true);

        await formulario.guardar();
        const errores = await formulario.erroresDeCampos();
        await capturar(sesion.driver, 'CP-W09 factura exportacion sin codigo aduanero', this, formulario.localizadores.tarjeta);
        expect(errores).to.include(msg.codigoObligatorio);

        await formulario.seleccionarTipo('Nacional');
        expect(await formulario.muestraCodigoAduanero(), 'se oculta al cambiar de tipo').to.equal(false);
    });

    // Pruebas guiadas por datos: una por cada factura válida de facturas.json.
    for (const factura of datos.validas) {
        it(`${factura.caso} crea una ${factura.descripcion.toLowerCase()}`, async function () {
            const cliente = `${factura.cliente} ${SUFIJO}`;
            await formulario.diligenciar({ ...factura, cliente });
            await capturar(sesion.driver, `${factura.caso} formulario diligenciado`, this, formulario.localizadores.tarjeta);
            await formulario.guardar();

            await listado.esperarCarga();
            const fila = await listado.filaDeCliente(cliente);
            await capturar(sesion.driver, `${factura.caso} factura en el listado`, this);

            expect(fila.numero).to.match(/^FAC-\d{5}$/);
            expect(fila.tipo).to.equal(factura.tipoEnTabla);
            expect(aNumero(fila.subtotal)).to.equal(factura.subtotal);
            expect(aNumero(fila.total)).to.equal(calcularTotal(factura.tipoEnTabla, factura.subtotal));
        });
    }

    it('CP-W13 cancelar vuelve al listado sin crear la factura', async function () {
        await listado.visitar(FacturasPage.ruta);
        await listado.esperarCarga();
        const antes = await listado.cantidadFilas();

        await formulario.abrir();
        await formulario.diligenciar({ cliente: `No guardar ${SUFIJO}`, tipo: 'Nacional', subtotal: 50000 });
        await formulario.cancelar();

        await listado.esperarCarga();
        await capturar(sesion.driver, 'CP-W13 cancelar sin guardar', this);
        expect(await listado.cantidadFilas()).to.equal(antes);
    });
});
