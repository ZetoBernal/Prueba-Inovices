using back_global_invoice.Domain;
using Microsoft.EntityFrameworkCore;

namespace back_global_invoice.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
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
}