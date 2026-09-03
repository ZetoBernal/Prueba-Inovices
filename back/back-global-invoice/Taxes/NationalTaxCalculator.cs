using back_global_invoice.Domain;

namespace back_global_invoice.Taxes;

public class NationalTaxCalculator : ITaxCalculator
{
    private const decimal IvaRate = 0.19m;

    public InvoiceType Type => InvoiceType.Nacional;

    public TaxResult Calculate(decimal subtotal)
    {
        var iva = Math.Round(subtotal * IvaRate, 0, MidpointRounding.AwayFromZero);

        return new TaxResult(subtotal, iva, Retencion: 0m, Total: subtotal + iva);
    }
}