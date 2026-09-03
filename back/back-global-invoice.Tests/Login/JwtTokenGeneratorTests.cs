using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using back_global_invoice.Common;
using back_global_invoice.Domain;
using back_global_invoice.Features.Login;
using Microsoft.Extensions.Options;

namespace back_global_invoice.Tests.Login;

public class JwtTokenGeneratorTests
{
    private readonly JwtTokenGenerator _generator = new(Options.Create(new JwtSettings
    {
        Key = "clave-de-pruebas-de-al-menos-32-bytes-para-hmac-sha256",
        Issuer = "GlobalInvoice.Api",
        Audience = "GlobalInvoice.Client",
        ExpirationMinutes = 60
    }));

    [Fact]
    public void Generate_IncluyeElClaimDeRol()
    {
        var user = new User { Id = 1, Username = "auditor", Role = Roles.Auditor };

        var (token, _) = _generator.Generate(user);
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(token).Claims.ToList();

        Assert.Contains(claims, c => c.Type == ClaimTypes.Role && c.Value == Roles.Auditor);
    }

    [Fact]
    public void Generate_IncluyeElNombreDeUsuario()
    {
        var user = new User { Id = 2, Username = "operador", Role = Roles.Operador };

        var (token, _) = _generator.Generate(user);
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(token).Claims.ToList();

        Assert.Contains(claims, c => c.Type == ClaimTypes.Name && c.Value == "operador");
    }

    [Fact]
    public void Generate_RespetaLosMinutosDeExpiracionConfigurados()
    {
        var user = new User { Id = 3, Username = "x", Role = Roles.Operador };

        var (_, expiresAt) = _generator.Generate(user);

        Assert.InRange(expiresAt, DateTime.UtcNow.AddMinutes(58), DateTime.UtcNow.AddMinutes(61));
    }
}
