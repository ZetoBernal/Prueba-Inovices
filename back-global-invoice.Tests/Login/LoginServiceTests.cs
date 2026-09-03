using back_global_invoice.Data;
using back_global_invoice.Domain;
using back_global_invoice.Features.Login;
using back_global_invoice.Features.Login.Dtos;
using Microsoft.EntityFrameworkCore;

namespace back_global_invoice.Tests.Login;

// Doble de prueba: no necesitamos generar un JWT real para probar el login.
file class FakeJwtTokenGenerator : IJwtTokenGenerator
{
    public (string Token, DateTime ExpiresAt) Generate(User user) =>
        ("token-de-prueba", DateTime.UtcNow.AddHours(1));
}

public class LoginServiceTests
{
    private static LoginService BuildService()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);

        db.Users.Add(new User
        {
            Username = "operador",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operador123*"),
            Role = Roles.Operador
        });
        db.SaveChanges();

        return new LoginService(db, new FakeJwtTokenGenerator());
    }

    [Fact]
    public async Task LoginAsync_DevuelveTokenConCredencialesValidas()
    {
        var service = BuildService();

        var result = await service.LoginAsync(
            new LoginRequest { Username = "operador", Password = "Operador123*" });

        Assert.NotNull(result);
        Assert.Equal("operador", result.Username);
        Assert.Equal(Roles.Operador, result.Role);
    }

    [Fact]
    public async Task LoginAsync_DevuelveNullConContrasenaIncorrecta()
    {
        var service = BuildService();

        var result = await service.LoginAsync(
            new LoginRequest { Username = "operador", Password = "incorrecta" });

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_DevuelveNullSiElUsuarioNoExiste()
    {
        // Este es el camino del hash señuelo: no debe lanzar excepción,
        // solo devolver null como si la contraseña fuera incorrecta.
        var service = BuildService();

        var result = await service.LoginAsync(
            new LoginRequest { Username = "fantasma", Password = "loquesea" });

        Assert.Null(result);
    }
}
