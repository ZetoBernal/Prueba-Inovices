using back_global_invoice.Domain;
using back_global_invoice.Taxes;

namespace back_global_invoice.Tests.Taxes;

public class GovernmentTaxCalculatorTests
{
    private readonly GovernmentTaxCalculator _calculator = new();

    [Fact]
    public void Type_EsGubernamental()
    {
        Assert.Equal(InvoiceType.Gubernamental, _calculator.Type);
    }

    [Theory]
    [InlineData(1_000_000, 190_000, 50_000, 1_140_000)]
    [InlineData(5_600_000, 1_064_000, 280_000, 6_384_000)]
    [InlineData(0, 0, 0, 0)]
    public void Calculate_AplicaIva19YRetencion5SobreElSubtotal(
        decimal subtotal, decimal ivaEsperado, decimal retencionEsperada, decimal totalEsperado)
    {
        var result = _calculator.Calculate(subtotal);

        Assert.Equal(ivaEsperado, result.Iva);
        Assert.Equal(retencionEsperada, result.Retencion);
        Assert.Equal(totalEsperado, result.Total);
    }

    [Fact]
    public void Calculate_LaRetencionSeCalculaSobreElSubtotalNoSobreSubtotalMasIva()
    {
        // Supuesto documentado del proyecto: la retención va sobre el subtotal.
        var result = _calculator.Calculate(1_000_000m);

        Assert.Equal(50_000m, result.Retencion);       // 5% de 1.000.000
        Assert.NotEqual(59_500m, result.Retencion);    // NO 5% de 1.190.000 (subtotal + IVA)
    }
}
