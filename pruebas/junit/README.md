# Pruebas con JUnit 5

Pruebas de la interfaz con Selenium WebDriver y de la API REST con TestRestTemplate, escritas en Java con JUnit 5 y AssertJ.

## Requisitos

- Java 17 y Maven
- Google Chrome
- El sistema arriba: API en `http://localhost:5273` y front en `https://localhost:4200`

## Ejecución

```bash
mvn test -Dgroups=web
mvn test -Dgroups=api
```

Las pruebas web y las de API van por separado por el límite de 5 inicios de sesión por minuto de la API.

## Variables opcionales

| Variable | Por defecto | Uso |
|---|---|---|
| `BASE_URL` | `https://localhost:4200` | URL del front |
| `API_URL` | `http://localhost:5273/api` | URL de la API |
| `HEADLESS` | `true` | `false` abre el navegador visible |
| `TIMEOUT_SEGUNDOS` | `10` | Espera explícita máxima |
| `EVIDENCIAS_DIR` | `../evidencias` | Carpeta de capturas |

## Estructura

```
src/test/java/pruebas/globalinvoice/
├── web/        pruebas de la interfaz y páginas (Page Object Model)
├── api/        pruebas de la API, cliente HTTP y sesiones
└── soporte/    configuración, driver, evidencias, reglas de negocio
src/test/resources/datos/   CSV de facturas y usuarios de prueba
```
