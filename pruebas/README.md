# Pruebas automatizadas

Pruebas funcionales de caja negra sobre Global Invoice, desarrolladas en los talleres AA1 y AA2 de la Unidad 2 de Prueba y Calidad de Software.

| Carpeta | Herramientas | Qué prueba | Casos |
|---|---|---|---|
| `selenium-postman/` | Selenium WebDriver, Mocha y Chai; Postman y Newman | Formularios de inicio de sesión y nueva factura; API REST de autenticación y facturas | 13 web y 23 de API |
| `junit/` | JUnit 5, Selenium WebDriver, TestRestTemplate y AssertJ, con Maven | Inicio de sesión, facturas y tablero del auditor; API REST de autenticación, facturas y seguridad | 10 web y 23 de API |

## Antes de ejecutar

El sistema tiene que estar arriba: API en `http://localhost:5273` y front en `https://localhost:4200`. Los pasos están en [docs/DESPLIEGUE.md](../docs/DESPLIEGUE.md).

La API admite 5 inicios de sesión por minuto por IP. Entre una suite y otra conviene esperar un minuto.

## Ejecución

```bash
cd pruebas/selenium-postman
npm install
npm test
```

```bash
cd pruebas/junit
mvn test -Dgroups=web
mvn test -Dgroups=api
```

Las capturas, los reportes y la salida de consola quedan en `pruebas/evidencias/`, que no se versiona.
