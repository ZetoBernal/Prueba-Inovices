using System.Security.Claims;
using back_global_invoice.Features.Login;
using back_global_invoice.Features.Login.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace back_global_invoice.Tests.Controllers;

file class FakeLoginService(LoginResponse? response) : ILoginService
{
    public Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default) =>
        Task.FromResult(response);
}

public class LoginControllerTests
{
    [Fact]
    public async Task Login_ConCredencialesValidas_DevuelveOkConElToken()
    {
        var response = new LoginResponse("token-de-prueba", "operador", "OPERADOR", DateTime.UtcNow.AddHours(1));
        var controller = new LoginController(new FakeLoginService(response));

        var result = await controller.Login(
            new LoginRequest { Username = "operador", Password = "Operador123*" }, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(response, ok.Value);
    }

    [Fact]
    public async Task Login_ConCredencialesInvalidas_DevuelveUnauthorized()
    {
        var controller = new LoginController(new FakeLoginService(null));

        var result = await controller.Login(
            new LoginRequest { Username = "x", Password = "incorrecta" }, CancellationToken.None);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public void Me_DevuelveElUsuarioYRolDelTokenActual()
    {
        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.Name, "auditor"),
            new Claim(ClaimTypes.Role, "AUDITOR")
        ], "TestAuth");

        var controller = new LoginController(new FakeLoginService(null))
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            }
        };

        var result = Assert.IsType<OkObjectResult>(controller.Me());

        Assert.NotNull(result.Value);
    }
}
