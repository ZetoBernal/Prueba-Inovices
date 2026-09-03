using System.Diagnostics.CodeAnalysis;
namespace back_global_invoice.Features.Invoices.Dtos;

[ExcludeFromCodeCoverage]
public record InvoiceDetailResponse(
    int Id,
    string Number,
    string CustomerName,
    string Type,
    decimal Subtotal,
    decimal Iva,
    decimal Retencion,
    decimal Total,
    string? CustomsCode,
    DateTime CreatedAt,
    string? TotalInWords
);