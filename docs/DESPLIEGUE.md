# Manual de despliegue

Pasos para levantar la versión 1.0.0 (línea base) en un equipo de desarrollo.

## Requisitos

- Git
- SDK de .NET 10
- Node.js 22 y npm
- OpenSSL (en Windows sirve el que trae Git Bash)
- Docker con una instancia de SQL Server (opcional: sin cadena de conexión la API usa una base en memoria)

## 1. Obtener la versión de la línea base

```bash
git clone https://github.com/ZetoBernal/Prueba-Inovices.git
cd Prueba-Inovices
git checkout v1.0.0
```

## 2. Generar los certificados HTTPS

La configuración de desarrollo de la API y el servidor de Angular trabajan con HTTPS y esperan `certs/server.cert.pem` y `certs/server.key.pem`. La clave privada no se versiona, así que hay que generarla:

```bash
bash certs/generar_certificados.sh
```

Para que el navegador confíe en el sitio, se importa la CA generada (`certs/ca.cert.pem`) como autoridad raíz de confianza.

## 3. Backend

```bash
cd back/back-global-invoice
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=GlobalInvoice;User Id=sa;Password=<clave>;TrustServerCertificate=True"
dotnet run
```

El primer comando se omite si se quiere trabajar con la base en memoria. La API queda en `https://localhost:7195` y `http://localhost:5273`, aplica las migraciones y siembra los datos de prueba al arrancar.

## 4. Frontend

```bash
cd front/front-global-invoice
npm ci
npm start
```

El sitio queda en `https://localhost:4200`. Usuarios de prueba: `operador` / `Operador123*` y `auditor` / `Auditor123*`.

## 5. Verificación

```bash
cd back && dotnet test GlobalInvoice.slnx
cd ../front/front-global-invoice && npx ng test --watch=false && npx ng build --configuration production
```

Las mismas tareas corren en GitHub Actions (`.github/workflows/ci.yml`) en cada push o pull request a `main` y `dev`.

## Problemas conocidos de la línea base

- La publicación en GitHub Pages (`.github/workflows/pages.yml`) falló en su primera ejecución y queda pendiente de revisión.
- `appsettings.Development.json` trae una clave JWT de ejemplo, válida solo para desarrollo; en otro entorno se define con `dotnet user-secrets` o variables de entorno.
