
namespace back_global_invoice.Features.Login.Dtos;

public record LoginResponse(string Token, string Username, string Role, DateTime ExpiresAt);