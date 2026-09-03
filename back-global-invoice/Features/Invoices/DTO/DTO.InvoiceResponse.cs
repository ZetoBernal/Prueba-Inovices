namespace back_global_invoice.Features.Invoices.Dtos;

public record InvoiceResponse(
    int Id,
    string Number,
    string CustomerName,
    string Type,
    decimal Subtotal,
    decimal Iva,
    decimal Retencion,
    decimal Total,
    string? CustomsCode,
    DateTime CreatedAt
);