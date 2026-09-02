using System.ComponentModel.DataAnnotations;

namespace back_global_invoice.Features.Login.Dtos;

public class LoginRequest
{
    [Required(ErrorMessage = "El usuario es obligatorio.")]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}