using System.Security.Claims;
using back_global_invoice.Features.Login.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace back_global_invoice.Features.Login;

[ApiController]
[Route("api/auth")]
public class LoginController(ILoginService auth) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await auth.LoginAsync(request, ct);

        return result is null
            ? Unauthorized(new { message = "Usuario o contraseña incorrectos." })
            : Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me() => Ok(new
    {
        username = User.Identity?.Name,
        role = User.FindFirstValue(ClaimTypes.Role)
    });
}