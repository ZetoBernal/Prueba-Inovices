# Estructura de la base de datos

Motor: SQL Server, a través de Entity Framework Core 10. El esquema se crea con migraciones; al arrancar, la API aplica las migraciones pendientes y siembra los datos de prueba (`Data/DbSeeder.cs`). Si no hay cadena de conexión, la API usa una base en memoria con el mismo modelo.

## Migraciones incluidas en la línea base

| Migración | Contenido |
|---|---|
| `20260902214931_InitialCreate` | Tabla `Users` |
| `20260903021423_AddInvoices` | Tabla `Invoices` |

## Tabla `Users`

| Columna | Tipo | Restricciones |
|---|---|---|
| `Id` | int | Llave primaria, identidad |
| `Username` | nvarchar(50) | Obligatorio, único |
| `PasswordHash` | nvarchar(255) | Obligatorio (hash BCrypt) |
| `Role` | nvarchar(20) | Obligatorio: `OPERADOR` o `AUDITOR` |

## Tabla `Invoices`

| Columna | Tipo | Restricciones |
|---|---|---|
| `Id` | int | Llave primaria, identidad |
| `Number` | nvarchar(20) | Obligatorio, único (formato `FAC-00001`) |
| `CustomerName` | nvarchar(150) | Obligatorio |
| `Type` | nvarchar(20) | Obligatorio: `Nacional`, `Exportacion` o `Gubernamental` |
| `Subtotal` | decimal(18,2) | |
| `Iva` | decimal(18,2) | 19 % del subtotal en Nacional y Gubernamental |
| `Retencion` | decimal(18,2) | 5 % del subtotal en Gubernamental |
| `Total` | decimal(18,2) | |
| `CustomsCode` | nvarchar(30) | Opcional, solo para Exportación |
| `CreatedAt` | datetime2 | |
| `CreatedBy` | nvarchar(50) | Obligatorio (usuario que creó la factura) |

Las dos tablas no tienen relación por llave foránea: `CreatedBy` guarda el nombre del usuario.

## Datos sembrados

- Usuarios `operador` (rol OPERADOR) y `auditor` (rol AUDITOR).
- Siete facturas de ejemplo, de la `FAC-00001` a la `FAC-00007`, de los tres tipos.
