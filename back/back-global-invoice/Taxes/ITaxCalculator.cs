using back_global_invoice.Domain;

namespace back_global_invoice.Taxes;

public interface ITaxCalculator
{
    InvoiceType Type { get; }
    TaxResult Calculate(decimal subtotal);
}