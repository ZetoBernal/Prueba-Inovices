# Registro de cambios

Todos los cambios relevantes de Global Invoice se documentan en este archivo.

El formato sigue [Keep a Changelog 1.1.0](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico 2.0.0](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Pruebas automatizadas en `pruebas/`: Selenium WebDriver y Postman con Newman (`selenium-postman/`), y JUnit 5 con Selenium WebDriver y TestRestTemplate (`junit/`).

## [1.0.0] - 2026-11-10

Primera línea base del sistema. Incluye todos los commits de la rama `main` desde `4dfb2f4` (first commit) hasta el commit que agrega este archivo, marcado con la etiqueta `v1.0.0`.

### Agregado

- Proyecto Angular 22 con Angular Material, archivos de entorno, `.gitignore` y CORS en la API (`46d498c`, `07b4739`).
- Autenticación con JWT: tabla `Users`, contraseñas con BCrypt, límite de 5 intentos de inicio de sesión por minuto e IP, `POST /api/auth/login` y `GET /api/auth/me` (`133b81c`).
- Pantalla de inicio de sesión y guardas de ruta por rol (OPERADOR y AUDITOR) en el front (`5d2b917`).
- Facturas en el backend y motor de tributación por tipo de factura (Nacional, Exportación y Gubernamental) con el patrón Strategy (`991d658`, `0c3a381`).
- Conversión del total a letras con el servicio SOAP legado y campo `totalInWords` en la respuesta (`d7c434b`, `d2ecc21`).
- Gestión de facturas en el front: servicio de API, store con signals y listado (`7e3d407`), creación con formulario y validaciones (`50ad9fa`) y detalle en un diálogo (`28b1b2d`).
- Dashboard del auditor con métricas y gráfico por tipo de factura hecho con D3 (`e53acdc`, `3dbe63a`).
- Pruebas unitarias del backend con xUnit y del frontend con Vitest (`8ddf6bb`, `ac427d2`).
- Integración continua con GitHub Actions: build y pruebas del backend y del frontend en cada push o pull request a `main` y `dev` (`14f15e6`).
- HTTPS con certificado propio en la API y el front, y flujo de publicación del front en GitHub Pages (`7945504`).
- Documentación de la línea base: este archivo, `LICENSE.txt`, `docs/BASE_DE_DATOS.md` y `docs/DESPLIEGUE.md`.

### Cambiado

- Reorganización de las carpetas `front/` y `back/` y de las rutas de `.gitignore` y `settings.json` (`9df5b2d`, `e9ee852`).
- Si no hay cadena de conexión configurada, la API trabaja con una base de datos en memoria (`7945504`).

[Sin publicar]: https://github.com/ZetoBernal/Prueba-Inovices/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ZetoBernal/Prueba-Inovices/releases/tag/v1.0.0
