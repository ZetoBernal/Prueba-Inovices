using System.Diagnostics.CodeAnalysis;

namespace back_global_invoice.Features.Login.Dtos;

[ExcludeFromCodeCoverage]
public record LoginResponse(string Token, string Username, string Role, DateTime ExpiresAt);