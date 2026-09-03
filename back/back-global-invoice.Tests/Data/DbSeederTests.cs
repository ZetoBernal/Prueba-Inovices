using back_global_invoice.Data;
using back_global_invoice.Domain;
using back_global_invoice.Taxes;
using Microsoft.EntityFrameworkCore;

namespace back_global_invoice.Tests.Data;

public class DbSeederTests
{
    private static AppDbContext BuildDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static readonly TaxCalculatorFactory TaxFactory = new(
    [
        new NationalTaxCalculator(),
        new ExportTaxCalculator(),
        new GovernmentTaxCalculator()
    ]);

    [Fact]
    public async Task SeedUsersAsync_CreaLosDosUsuariosDePruebaSiNoHayNinguno()
    {
        var db = BuildDb();

        await DbSeeder.SeedUsersAsync(db);

        var users = await db.Users.ToListAsync();
        Assert.Equal(2, users.Count);
        Assert.Contains(users, u => u.Username == "operador" && u.Role == Roles.Operador);
        Assert.Contains(users, u => u.Username == "auditor" && u.Role == Roles.Auditor);
    }

    [Fact]
    public async Task SeedUsersAsync_EsIdempotente_NoDuplicaSiYaHayUsuarios()
    {
        var db = BuildDb();

        await DbSeeder.SeedUsersAsync(db);
        await DbSeeder.SeedUsersAsync(db);

        Assert.Equal(2, await db.Users.CountAsync());
    }

    [Fact]
    public async Task SeedInvoicesAsync_CreaLasFacturasDeEjemploUsandoElMotorReal()
    {
        var db = BuildDb();

        await DbSeeder.SeedInvoicesAsync(db, TaxFactory, CancellationToken.None);

        var invoices = await db.Invoices.ToListAsync();

        Assert.Equal(7, invoices.Count);
        Assert.All(invoices, i => Assert.True(i.Total >= i.Subtotal - i.Retencion));
    }

    [Fact]
    public async Task SeedInvoicesAsync_EsIdempotente_NoDuplicaSiYaHayFacturas()
    {
        var db = BuildDb();

        await DbSeeder.SeedInvoicesAsync(db, TaxFactory, CancellationToken.None);
        await DbSeeder.SeedInvoicesAsync(db, TaxFactory, CancellationToken.None);

        Assert.Equal(7, await db.Invoices.CountAsync());
    }
}
