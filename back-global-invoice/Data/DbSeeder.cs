using back_global_invoice.Domain;
using Microsoft.EntityFrameworkCore;
using back_global_invoice.Taxes;

namespace back_global_invoice.Data;

public static class DbSeeder
{

    public static async Task SeedAsync(
        AppDbContext db, ITaxCalculatorFactory taxCalculators, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);

        await SeedUsersAsync(db, ct);
        await SeedInvoicesAsync(db, taxCalculators, ct);
    }

    private static async Task SeedUsersAsync(AppDbContext db, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);

        if (await db.Users.AnyAsync(ct)) return;

        db.Users.AddRange(
            new User
            {
                Username = "operador",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operador123*"),
                Role = Roles.Operador
            },
            new User
            {
                Username = "auditor",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Auditor123*"),
                Role = Roles.Auditor
            });

        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedInvoicesAsync(AppDbContext db, ITaxCalculatorFactory taxCalculators, CancellationToken ct)
    {
        if (await db.Invoices.AnyAsync(ct)) return;

        (string Customer, InvoiceType Type, decimal Subtotal, string? Customs)[] samples =
        [
            ("Almacen", InvoiceType.Nacional, 2_500_000m, null),
            ("Distribuidora 1", InvoiceType.Nacional, 1_200_000m, null),
            ("Distribuidora 2", InvoiceType.Exportacion, 8_400_000m, "ADU-2026-0001"),
            ("Doña Susana", InvoiceType.Exportacion, 3_150_000m, "ADU-2026-0002"),
            ("Dato 1", InvoiceType.Gubernamental, 5_600_000m, null),
            ("Dato 2", InvoiceType.Gubernamental, 4_300_000m, null),
            ("Dato 3", InvoiceType.Exportacion, 4_300_000m, "ADU-2026-0003")
        ];

        var index = 1;

        foreach (var sample in samples)
        {
            var taxes = taxCalculators.For(sample.Type).Calculate(sample.Subtotal);

            db.Invoices.Add(new Invoice
            {
                Number = $"FAC-{index:D5}",
                CustomerName = sample.Customer,
                Type = sample.Type,
                Subtotal = taxes.Subtotal,
                Iva = taxes.Iva,
                Retencion = taxes.Retencion,
                Total = taxes.Total,
                CustomsCode = sample.Customs,
                CreatedAt = DateTime.UtcNow.AddDays(-index),
                CreatedBy = "operador"
            });

            index++;
        }

        await db.SaveChangesAsync(ct);
    }
}