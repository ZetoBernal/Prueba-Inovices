using System.ComponentModel.DataAnnotations;
using back_global_invoice.Domain;

namespace back_global_invoice.Features.Invoices.Dtos;

public class CreateInvoiceRequest : IValidatableObject
{
    [Required(ErrorMessage = "El cliente es obligatorio.")]
    [MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [EnumDataType(typeof(InvoiceType), ErrorMessage = "El tipo de factura no es válido.")]
    public InvoiceType Type { get; set; }

    [Range(0.01, 999_999_999_999, ErrorMessage = "El subtotal debe ser mayor que cero.")]
    public decimal Subtotal { get; set; }

    [MaxLength(30)]
    public string? CustomsCode { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Type == InvoiceType.Exportacion && string.IsNullOrWhiteSpace(CustomsCode))
        {
            yield return new ValidationResult(
                "El código aduanero es obligatorio para facturas de exportación.",
                [nameof(CustomsCode)]);
        }
    }
}