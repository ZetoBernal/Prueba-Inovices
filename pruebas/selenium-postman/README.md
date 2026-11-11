# Pruebas automatizadas · Global Invoice

Pruebas funcionales de caja negra sobre [Prueba-Inovices](https://github.com/ZetoBernal/Prueba-Inovices):

| Suite | Herramienta | Qué prueba | Casos |
|---|---|---|---|
| `web/` | Selenium WebDriver + Mocha + Chai | Formularios de **inicio de sesión** y **nueva factura** (Angular) | CP-W01 … CP-W13 |
| `api/` | Postman + Newman | Endpoints REST de **autenticación** y **facturas** (.NET) | CP-A01 … CP-A23 |

## Requisitos

- Node.js 20 o superior y Google Chrome (Selenium Manager descarga solo el chromedriver).
- El sistema bajo prueba corriendo:
  - API en `http://localhost:5273` y front en `https://localhost:4200` (ver `docs/DESPLIEGUE.md`).

## Ejecución

```bash
npm install
npm test
```

`npm test` corre las dos suites con una pausa de 65 s entre ellas; `npm run test:web` corre solo la de formularios y `npm run test:api`, solo la de la API.

La pausa existe porque el backend admite **5 intentos de login por minuto por IP**. Selenium inicia
sesión 4 veces y la suite de API necesita la ventana limpia.

Variables de entorno opcionales:

| Variable | Por defecto | Uso |
|---|---|---|
| `BASE_URL` | `https://localhost:4200` | URL del front |
| `HEADLESS` | `true` | `false` abre el navegador visible |
| `TIMEOUT` | `10000` | Espera explícita máxima por elemento (ms) |
| `CHROME_BIN`, `CHROMEDRIVER_PATH`, `CHROME_ARGS` | Sin valor | Navegador o driver alternativos (CI, contenedores) |

En PowerShell: `$env:HEADLESS="false"; npm run test:web`

## Resultados

Todo queda en `../evidencias/`:

```
evidencias/
├── selenium/    capturas PNG numeradas de cada caso (y FALLO-*.png si alguno falla)
├── reportes/    reporte-selenium.html (mochawesome) · reporte-api.html (htmlextra) · JSON
└── consola/     salida-selenium.txt · salida-api.txt
```

## Estructura y buenas prácticas

```
web/
├── pages/       Page Object Model: BasePage (esperas explícitas), LoginPage, FacturasPage, NuevaFacturaPage
├── support/     config, fábrica de WebDriver, hooks (captura automática si falla), evidencias, reglas de negocio
├── datos/       usuarios.json y facturas.json (datos separados del código)
└── tests/       01-login.spec.js · 02-nueva-factura.spec.js
api/
├── GlobalInvoice.postman_collection.json   4 carpetas, token JWT encadenado, esquema JSON, roles, rate limiting
├── local.postman_environment.json          URL y credenciales (las claves como "secret")
└── datos/casos-facturas.csv                8 casos guiados por datos del motor de impuestos
scripts/ejecutar.js                          corre las suites y guarda la salida de consola
```

- **Sin esperas fijas**: todas las esperas son explícitas (`until.elementLocated`, `urlContains`…).
- **Localizadores estables**: atributos `formcontrolname`, `role` y `aria-label`; no clases de estilo.
- **Oráculo independiente**: `support/reglas-negocio.js` calcula el total esperado (IVA 19 %, retención 5 %)
  y lo compara con lo que muestra la interfaz.
- **Guiado por datos**: los mismos scripts recorren varios casos desde JSON y CSV.
- **Manejo de errores**: captura automática al fallar, mensajes de espera descriptivos y una captura que
  falla no tumba la prueba.

## Importar en Postman (opcional)

*Import* → `api/GlobalInvoice.postman_collection.json` y `api/local.postman_environment.json` → seleccionar el
entorno **Global Invoice - Local** → *Run collection* → *Select file* `api/datos/casos-facturas.csv`.
