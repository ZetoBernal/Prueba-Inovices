/**
 * Ganchos comunes a todas las suites web: abrir y cerrar el navegador
 * y guardar una captura automática cuando una prueba falla.
 */
const { crearDriver } = require('./driver-factory');
const { capturar } = require('./evidencias');

/**
 * Registra los hooks en la suite actual y devuelve un objeto cuyo
 * atributo `driver` estará disponible dentro de las pruebas.
 */
function usarNavegador() {
    const sesion = { driver: null };

    before(async function () {
        sesion.driver = await crearDriver();
    });

    afterEach(async function () {
        if (this.currentTest.state === 'failed' && sesion.driver) {
            await capturar(sesion.driver, `FALLO ${this.currentTest.title}`, this);
        }
    });

    after(async function () {
        if (sesion.driver) await sesion.driver.quit();
    });

    return sesion;
}

module.exports = { usarNavegador };
