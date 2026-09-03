using back_global_invoice.Data;
using back_global_invoice.Domain;
using back_global_invoice.Features.Invoices.Dtos;
using back_global_invoice.Taxes;
using Microsoft.EntityFrameworkCore;
using back_global_invoice.Legacy;

namespace back_global_invoice.Features.Invoices;

public interface IInvoiceService
{
    Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request, string username, CancellationToken ct = default);
    Task<IReadOnlyList<InvoiceResponse>> GetAllAsync(CancellationToken ct = default);
    Task<InvoiceDetailResponse?> GetByIdAsync(int id, CancellationToken ct = default);
}

public class InvoiceService(AppDbContext db, ITaxCalculatorFactory taxCalculators, INumberToWordsService numberToWords) : IInvoiceService
{
    public async Task<InvoiceResponse> CreateAsync(
        CreateInvoiceRequest request, string username, CancellationToken ct = default)
    {
        var taxes = taxCalculators.For(request.Type).Calculate(request.Subtotal);

        var invoice = new Invoice
        {
            Number = await NextNumberAsync(ct),
            CustomerName = request.CustomerName.Trim(),
            Type = request.Type,
            Subtotal = taxes.Subtotal,
            Iva = taxes.Iva,
            Retencion = taxes.Retencion,
            Total = taxes.Total,

            CustomsCode = request.Type == InvoiceType.Exportacion
                ? request.CustomsCode?.Trim()
                : null,

            CreatedAt = DateTime.UtcNow,
            CreatedBy = username
        };

        db.Invoices.Add(invoice);
        await db.SaveChangesAsync(ct);

        return ToResponse(invoice);
    }

    public async Task<IReadOnlyList<InvoiceResponse>> GetAllAsync(CancellationToken ct = default) =>
        await db.Invoices
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => ToResponse(i))
            .ToListAsync(ct);

    public async Task<InvoiceDetailResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var invoice = await db.Invoices
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id, ct);

        if (invoice is null) return null;

        var totalInWords = await numberToWords.ConvertAsync(invoice.Total, ct);

        return new InvoiceDetailResponse(
            invoice.Id, invoice.Number, invoice.CustomerName, invoice.Type.ToString(),
            invoice.Subtotal, invoice.Iva, invoice.Retencion, invoice.Total,
            invoice.CustomsCode, invoice.CreatedAt, totalInWords);
    }

    private async Task<string> NextNumberAsync(CancellationToken ct)
    {
        var count = await db.Invoices.CountAsync(ct);
        return $"FAC-{count + 1:D5}";
    }

    private static InvoiceResponse ToResponse(Invoice i) => new(
        i.Id, i.Number, i.CustomerName, i.Type.ToString(),
        i.Subtotal, i.Iva, i.Retencion, i.Total, i.CustomsCode, i.CreatedAt);
}