/**
 * Suite 1 - Formulario de inicio de sesión.
 * Valida las reglas del formulario en el cliente (campos obligatorios y
 * longitud mínima), la respuesta ante credenciales inválidas y la
 * redirección por rol después de un login exitoso.
 *
 * Nota: el backend permite 5 intentos de login por minuto por IP. Esta suite
 * hace solo 3 peticiones reales (CP-W03, CP-W04 y CP-W05); las demás
 * validaciones ocurren en el navegador sin llamar a la API.
 */
const { expect } = require('chai');
const { usarNavegador } = require('../support/hooks');
const { capturar } = require('../support/evidencias');
const { LoginPage } = require('../pages/LoginPage');
const { FacturasPage } = require('../pages/FacturasPage');
const usuarios = require('../datos/usuarios.json');

describe('Formulario de inicio de sesión', function () {
    const sesion = usarNavegador();
    let login;

    beforeEach(async function () {
        login = new LoginPage(sesion.driver);
        await login.limpiarSesion();
        await login.abrir();
    });

    it('CP-W01 muestra los mensajes de obligatoriedad al enviar el formulario vacío', async function () {
        await login.enviarVacio();

        const errores = await login.erroresDeCampos();
        await capturar(sesion.driver, 'CP-W01 login campos vacios', this, login.localizadores.tarjeta);

        expect(errores).to.include('El usuario es obligatorio');
        expect(errores).to.include('La contraseña es obligatoria');
        expect(await sesion.driver.getCurrentUrl()).to.contain(LoginPage.ruta);
    });

    it('CP-W02 exige una contraseña de mínimo 6 caracteres', async function () {
        const datos = usuarios.claveCorta;
        await login.iniciarSesion(datos.usuario, datos.clave);

        const errores = await login.erroresDeCampos();
        await capturar(sesion.driver, 'CP-W02 login clave corta', this, login.localizadores.tarjeta);

        expect(errores).to.include(datos.mensajeEsperado);
        expect(await sesion.driver.getCurrentUrl()).to.contain(LoginPage.ruta);
    });

    it('CP-W03 rechaza credenciales incorrectas con un mensaje claro', async function () {
        const datos = usuarios.invalido;
        await login.iniciarSesion(datos.usuario, datos.clave);

        const mensaje = await login.mensajeError();
        await capturar(sesion.driver, 'CP-W03 login credenciales invalidas', this, login.localizadores.tarjeta);

        expect(mensaje).to.equal(datos.mensajeEsperado);
        expect(await sesion.driver.getCurrentUrl()).to.contain(LoginPage.ruta);
    });

    it('CP-W06 permite mostrar y ocultar la contraseña', async function () {
        await login.escribir(login.localizadores.clave, 'Secreta123');
        expect(await login.tipoCampoClave()).to.equal('password');

        await login.alternarVisibilidadClave();
        await capturar(sesion.driver, 'CP-W06 login clave visible', this, login.localizadores.tarjeta);
        expect(await login.tipoCampoClave()).to.equal('text');

        await login.alternarVisibilidadClave();
        expect(await login.tipoCampoClave()).to.equal('password');
    });

    // Pruebas guiadas por datos: un caso por cada usuario válido de usuarios.json.
    for (const usuario of usuarios.validos) {
        it(`${usuario.caso} inicia sesión como ${usuario.rol} y llega a ${usuario.rutaInicio}`, async function () {
            await login.iniciarSesion(usuario.usuario, usuario.clave);

            const url = await login.esperarUrl(usuario.rutaInicio);
            const facturas = new FacturasPage(sesion.driver);
            const barra = await facturas.usuarioEnBarra();
            await capturar(sesion.driver, `${usuario.caso} login ${usuario.usuario} exitoso`, this);

            expect(url).to.contain(usuario.rutaInicio);
            expect(barra).to.contain(usuario.usuario).and.to.contain(usuario.rol);
            const token = await sesion.driver.executeScript("return localStorage.getItem('gi_token');");
            expect(token, 'la app debe guardar el JWT').to.match(/^[\w-]+\.[\w-]+\.[\w-]+$/);

            // Control de acceso por rol en la interfaz.
            await facturas.visitar(FacturasPage.ruta);
            await facturas.esperarCarga();
            expect(await facturas.puedeCrearFacturas()).to.equal(usuario.puedeCrear);

            if (!usuario.puedeCrear) {
                // Entrar directo a la URL protegida debe devolverlo a su inicio.
                await facturas.visitar('/invoices/new');
                expect(await facturas.esperarUrl(usuario.rutaInicio)).to.not.contain('/invoices/new');
                await capturar(sesion.driver, `${usuario.caso} ${usuario.usuario} sin acceso a nueva factura`, this);
            }
        });
    }
});
