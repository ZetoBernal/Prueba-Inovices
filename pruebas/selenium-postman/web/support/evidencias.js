/**
 * Utilidades de evidencia: guarda capturas de pantalla numeradas y las
 * adjunta al reporte HTML de mochawesome.
 */
const fs = require('fs');
const path = require('path');
const addContext = require('mochawesome/addContext');
const config = require('./config');

// Cada ejecución arranca con la carpeta de capturas limpia, para que las
// evidencias correspondan siempre a la última corrida.
fs.mkdirSync(config.evidenciasDir, { recursive: true });
for (const archivo of fs.readdirSync(config.evidenciasDir)) {
    if (archivo.endsWith('.png')) fs.unlinkSync(path.join(config.evidenciasDir, archivo));
}

let consecutivo = 0;

/** Convierte un texto libre en un nombre de archivo seguro. */
function nombreSeguro(texto) {
    return texto
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
        .slice(0, 80);
}

/**
 * Toma una captura y la deja en evidencias/selenium.
 * @param {import('selenium-webdriver').WebDriver} driver
 * @param {string} nombre  descripción corta de lo que muestra la captura
 * @param {Mocha.Context} [contexto] contexto de mocha (this) para adjuntarla al reporte
 * @param {import('selenium-webdriver').Locator} [elemento] si se indica, captura solo ese elemento
 */
async function capturar(driver, nombre, contexto, elemento) {
    consecutivo += 1;
    const archivo = `${String(consecutivo).padStart(2, '0')}-${nombreSeguro(nombre)}.png`;
    const ruta = path.join(config.evidenciasDir, archivo);

    try {
        // Esperar a que terminen las animaciones de Angular Material (los mensajes de
        // error aparecen con un fundido) para que la captura muestre el estado final.
        await driver.wait(() => driver.executeScript(
            "return document.getAnimations().every(a => a.playState !== 'running');"), 2000).catch(() => {});
        const objetivo = elemento ? await driver.findElement(elemento) : driver;
        const imagen = await objetivo.takeScreenshot();
        fs.writeFileSync(ruta, imagen, 'base64');
        if (contexto) {
            // Ruta relativa al reporte (evidencias/reportes -> evidencias/selenium).
            addContext(contexto, { title: nombre, value: `../selenium/${archivo}` });
        }
    } catch (error) {
        // Una captura fallida no debe tumbar la prueba: se registra y se sigue.
        console.warn(`No se pudo guardar la captura "${nombre}": ${error.message}`);
    }

    return ruta;
}

module.exports = { capturar };
