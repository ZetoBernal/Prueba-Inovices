/**
 * Fábrica de WebDriver: un único punto donde se decide qué navegador
 * y con qué opciones se ejecutan las pruebas.
 */
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('./config');

async function crearDriver() {
    const opciones = new chrome.Options()
        .addArguments(`--window-size=${config.ventana.width},${config.ventana.height}`)
        .addArguments('--lang=es-CO')
        // El frontend usa un certificado autofirmado (taller de Seguridad de Software).
        .addArguments('--ignore-certificate-errors')
        .setAcceptInsecureCerts(true);

    if (config.headless) {
        opciones.addArguments('--headless=new', '--disable-gpu');
    }

    // CHROME_BIN permite usar un ejecutable de Chrome/Chromium distinto al instalado.
    if (process.env.CHROME_BIN) {
        opciones.setChromeBinaryPath(process.env.CHROME_BIN);
    }

    // Argumentos extra por entorno (ej. "--no-sandbox" en contenedores Linux o CI).
    if (process.env.CHROME_ARGS) {
        opciones.addArguments(...process.env.CHROME_ARGS.split(' ').filter(Boolean));
    }

    const builder = new Builder().forBrowser('chrome').setChromeOptions(opciones);

    // Selenium Manager descarga el chromedriver correcto automáticamente.
    // CHROMEDRIVER_PATH permite usar uno ya instalado si no hay internet.
    if (process.env.CHROMEDRIVER_PATH) {
        builder.setChromeService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH));
    }

    const driver = await builder.build();
    await driver.manage().setTimeouts({ pageLoad: 30000 });
    return driver;
}

module.exports = { crearDriver };
