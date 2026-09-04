# Global Invoice

Prueba técnica Full Stack: motor de tributación dinámico, integración con un sistema legado por SOAP, dashboard reactivo y control de acceso por roles.

## Arquitectura

**Backend** — `back/back-global-invoice` (.NET 10, ASP.NET Core Web API)

```
back/
├── back-global-invoice/
│   ├── Domain/          Entidades y enums del negocio
│   ├── Data/            EF Core, DbContext, migraciones, seed
│   ├── Taxes/            Motor de tributación (Strategy + Factory) — RF-01
│   ├── Legacy/           Adaptador SOAP (anti-corruption layer) — RF-03
│   ├── Features/
│   │   ├── Login/        Autenticación JWT
│   │   └── Invoices/     CRUD de facturas
│   └── Common/           Configuración transversal
├── back-global-invoice.Tests/   Pruebas unitarias (xUnit)
└── GlobalInvoice.slnx
```

El motor de tributación resuelve el cálculo por tipo de factura mediante el patrón **Strategy**: cada tipo (`NationalTaxCalculator`, `ExportTaxCalculator`, `GovernmentTaxCalculator`) implementa `ITaxCalculator`, y una `TaxCalculatorFactory` los resuelve por tipo sin ningún `switch`. Agregar un tipo nuevo (ej. "ONG") solo requiere una clase nueva y una línea de registro en `Program.cs` — cero cambios en el código existente (Open/Closed).

El sistema SOAP legado (conversión de número a letras) está aislado detrás de `INumberToWordsService`. El frontend nunca ve XML ni sabe que SOAP existe — solo recibe un campo `totalInWords` en JSON. Si el servicio externo falla, la factura se sigue mostrando (`totalInWords: null`).

**Frontend** — `front/front-global-invoice` (Angular 22, standalone components, signals)

```
front/front-global-invoice/src/app/
├── core/          Servicios transversales: auth, store de facturas, interceptores
├── shared/        Componentes reutilizables sin lógica de negocio
├── features/      Una carpeta por área: auth, invoices, dashboard
└── layout/        Shell de la aplicación
```

El estado de facturas vive en `core/invoices/invoice.store.ts`: un signal compartido que consumen el listado, el formulario de creación y el dashboard. La carga inicial ocurre una sola vez (bandera `loaded`); crear una factura la agrega en memoria en vez de recargar la lista, y el dashboard deriva sus totales con `computed()` — así se cumple el requisito de actualización instantánea sin peticiones HTTP redundantes.

## Cómo levantarlo

**1. Base de datos** (SQL Server en Docker):

```bash
docker start sql_server_container
```

**2. Backend:**

```bash
cd back/back-global-invoice
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=GlobalInvoice;User Id=sa;Password=<tu_password>;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 48)"
dotnet run
```

La API queda en `http://localhost:5273`. Al arrancar, aplica las migraciones y siembra los usuarios y facturas de prueba automáticamente.

**3. Frontend:**

```bash
cd front/front-global-invoice
npm install
npm start
```

Queda en `http://localhost:4200`.

## Usuarios de prueba

| Usuario | Contraseña | Rol | Puede |
|---|---|---|---|
| `operador` | `Operador123*` | OPERADOR | Crear facturas, ver el listado |
| `auditor` | `Auditor123*` | AUDITOR | Ver el dashboard y el listado |

## Pruebas y cobertura

**Backend:**
```bash
cd back && dotnet test GlobalInvoice.slnx
```
54 pruebas. Cubre el motor de tributación, autenticación, JWT, servicio de facturas, controladores, el adaptador SOAP (incluyendo su comportamiento ante fallas) y el seed de datos. Se excluyen del cálculo de cobertura las migraciones de EF, la composición de arranque (`Program.cs`) y los DTOs sin lógica propia — código generado o sin ramas que testear.

**Frontend:**
```bash
cd front/front-global-invoice && npx ng test --watch=false
```
55 pruebas: guards de rol, utilidades de JWT, servicios (`AuthService`, `InvoiceStore`, `InvoiceApiService`), interceptores HTTP y el componente de login.

## CI

`.github/workflows/ci.yml` ejecuta, en cada push/PR a `main` y `dev`: restauración de dependencias, build en modo Release y la suite de pruebas para el backend; `npm ci`, pruebas y build de producción para el frontend.

## Supuestos documentados

- **Retención en la fuente (Gubernamental):** se calcula sobre el **subtotal**, no sobre subtotal + IVA. El enunciado no lo especifica; es la práctica estándar de retención en Colombia.
- **Moneda:** los montos se manejan en pesos colombianos, sin decimales. Los impuestos se redondean a peso entero con `MidpointRounding.AwayFromZero` (no el redondeo bancario por defecto de .NET).
- **Código Aduanero:** se maneja como texto libre (máx. 30 caracteres); el enunciado no especifica un formato.

## Limitaciones conocidas

- El consecutivo de número de factura se genera contando filas; con alta concurrencia existe una condición de carrera teórica. En producción se resolvería con una secuencia de base de datos.
- El pipeline de CI valida build y pruebas, pero aún no aplica un umbral mínimo de cobertura como gate de fallo.
- El flujo de ramas actual es `dev` → `main` vía PR; una etapa intermedia de `test` está planeada como siguiente paso.
