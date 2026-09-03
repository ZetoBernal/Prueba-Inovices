using back_global_invoice.Domain;

namespace back_global_invoice.Taxes;

public class ExportTaxCalculator : ITaxCalculator
{
    public InvoiceType Type => InvoiceType.Exportacion;

    public TaxResult Calculate(decimal subtotal) =>
        new(subtotal, Iva: 0m, Retencion: 0m, Total: subtotal);
}