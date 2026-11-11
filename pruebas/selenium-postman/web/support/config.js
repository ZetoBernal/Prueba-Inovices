/**
 * Configuración centralizada de la suite web.
 * Todo valor que cambie entre máquinas se lee de variables de entorno,
 * con un valor por defecto pensado para el entorno local del proyecto.
 */
const path = require('path');

module.exports = Object.freeze({
    // El frontend Angular se sirve con HTTPS (certificado propio) en el puerto 4200.
    baseUrl: process.env.BASE_URL || 'https://localhost:4200',

    // HEADLESS=false abre el navegador visible (útil para demostrar la ejecución).
    headless: process.env.HEADLESS !== 'false',

    // Tiempo máximo de espera explícita para cada elemento (ms).
    timeout: Number(process.env.TIMEOUT || 10000),

    // Carpeta donde se guardan las capturas de evidencia.
    evidenciasDir: path.resolve(__dirname, '..', '..', '..', 'evidencias', 'selenium'),

    // Tamaño de ventana fijo para que las capturas sean comparables entre ejecuciones.
    ventana: { width: 1366, height: 900 }
});
