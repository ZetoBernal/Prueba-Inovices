/**
 * Ejecutor de las suites. Muestra la salida en consola y además la guarda
 * (sin colores) en evidencias/consola/, para adjuntarla al informe.
 *
 *   node scripts/ejecutar.js web    -> formularios web (Selenium + Mocha)
 *   node scripts/ejecutar.js api    -> API REST (Postman + Newman)
 *   node scripts/ejecutar.js todo   -> ambas, con la pausa de rate limiting
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const carpetaConsola = path.resolve(raiz, '..', 'evidencias', 'consola');
fs.mkdirSync(carpetaConsola, { recursive: true });

const bin = nombre => path.join(raiz, 'node_modules', '.bin', process.platform === 'win32' ? `${nombre}.cmd` : nombre);

const suites = {
    web: {
        titulo: 'Formularios web - Selenium WebDriver',
        comando: bin('mocha'),
        args: ['--config', 'web/.mocharc.json'],
        log: 'salida-selenium.txt'
    },
    api: {
        titulo: 'API REST - Postman / Newman',
        comando: bin('newman'),
        args: [
            'run', 'api/GlobalInvoice.postman_collection.json',
            '-e', 'api/local.postman_environment.json',
            '-d', 'api/datos/casos-facturas.csv',
            '--insecure',
            '-r', 'cli,htmlextra,json',
            '--reporter-htmlextra-export', '../evidencias/reportes/reporte-api.html',
            '--reporter-htmlextra-title', 'Global Invoice - Pruebas API REST',
            '--reporter-htmlextra-browserTitle', 'Reporte API',
            '--reporter-json-export', '../evidencias/reportes/resultado-api.json'
        ],
        log: 'salida-api.txt'
    }
};

const sinColores = texto => texto.replace(/\u001b\[[0-9;]*m/g, '');

function correr(clave) {
    const suite = suites[clave];
    return new Promise(resolve => {
        const archivo = path.join(carpetaConsola, suite.log);
        const salida = fs.createWriteStream(archivo);
        const encabezado = `# ${suite.titulo}\n# Ejecutado: ${new Date().toLocaleString('es-CO')}\n\n`;
        salida.write(encabezado);
        process.stdout.write(encabezado);

        const proceso = spawn(suite.comando, suite.args, {
            cwd: raiz,
            shell: process.platform === 'win32',
            env: { ...process.env, FORCE_COLOR: '1' }
        });

        const reenviar = destino => datos => {
            destino.write(datos);
            salida.write(sinColores(datos.toString()));
        };
        proceso.stdout.on('data', reenviar(process.stdout));
        proceso.stderr.on('data', reenviar(process.stderr));

        proceso.on('close', codigo => {
            salida.end(`\n# Código de salida: ${codigo}\n`);
            console.log(`\nSalida guardada en ${path.relative(process.cwd(), archivo)}\n`);
            resolve(codigo ?? 1);
        });
    });
}

const esperar = segundos => new Promise(resolve => {
    // El login admite 5 intentos por minuto por IP (Program.cs del backend):
    // se espera a que la ventana se reinicie antes de la suite de API.
    console.log(`Esperando ${segundos} s para reiniciar la ventana de rate limiting del login...`);
    setTimeout(resolve, segundos * 1000);
});

/** Deja constancia de dónde y cuándo se ejecutaron las pruebas (lo usa el informe). */
function registrarEntorno(modo) {
    const archivo = path.resolve(raiz, '..', 'evidencias', 'entorno.json');
    const entorno = {
        fecha: new Date().toISOString(),
        modo,
        entorno: process.env.ENTORNO_EJECUCION || 'local',
        sistemaOperativo: `${process.platform} ${require('os').release()}`,
        node: process.version,
        baseUrl: process.env.BASE_URL || 'https://localhost:4200'
    };
    fs.writeFileSync(archivo, JSON.stringify(entorno, null, 2));
}

(async () => {
    const modo = process.argv[2] || 'todo';
    let codigo = 0;
    registrarEntorno(modo);

    if (modo === 'web' || modo === 'todo') codigo |= await correr('web');
    if (modo === 'todo') await esperar(65);
    if (modo === 'api' || modo === 'todo') codigo |= await correr('api');

    if (!suites[modo] && modo !== 'todo') {
        console.error(`Modo desconocido "${modo}". Usa: web | api | todo`);
        codigo = 1;
    }
    process.exit(codigo);
})();
