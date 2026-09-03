using back_global_invoice.Domain;

namespace back_global_invoice.Taxes;

public class GovernmentTaxCalculator : ITaxCalculator
{
    private const decimal IvaRate = 0.19m;
    private const decimal WithholdingRate = 0.05m;

    public InvoiceType Type => InvoiceType.Gubernamental;
    
    public TaxResult Calculate(decimal subtotal)
    {
        var iva = Math.Round(subtotal * IvaRate, 0, MidpointRounding.AwayFromZero);
        var retencion = Math.Round(subtotal * WithholdingRate, 0, MidpointRounding.AwayFromZero);

        return new TaxResult(subtotal, iva, retencion, subtotal + iva - retencion);
    }
}