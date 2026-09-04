using back_global_invoice.Data;
using back_global_invoice.Features.Login.Dtos;
using Microsoft.EntityFrameworkCore;

namespace back_global_invoice.Features.Login;

public interface ILoginService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
}

public class LoginService(AppDbContext db, IJwtTokenGenerator tokens) : ILoginService
{
    private const string DummyHash = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Username == request.Username, ct);

        var hashToVerify = user?.PasswordHash ?? DummyHash;
        var passwordIsValid = BCrypt.Net.BCrypt.Verify(request.Password, hashToVerify);

        if (user is null || !passwordIsValid) return null;

        var (token, expiresAt) = tokens.Generate(user);
        return new LoginResponse(token, user.Username, user.Role, expiresAt);
    }
}