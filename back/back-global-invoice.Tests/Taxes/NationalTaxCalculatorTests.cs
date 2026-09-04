using back_global_invoice.Domain;
using back_global_invoice.Taxes;

namespace back_global_invoice.Tests.Taxes;

public class NationalTaxCalculatorTests
{
    private readonly NationalTaxCalculator _calculator = new();

    [Fact]
    public void Type_EsNacional()
    {
        Assert.Equal(InvoiceType.Nacional, _calculator.Type);
    }

    [Theory]
    [InlineData(1_000_000, 190_000, 1_190_000)]
    [InlineData(2_500_000, 475_000, 2_975_000)]
    [InlineData(0, 0, 0)]
    public void Calculate_AplicaIva19SinRetencion(decimal subtotal, decimal ivaEsperado, decimal totalEsperado)
    {
        var result = _calculator.Calculate(subtotal);

        Assert.Equal(ivaEsperado, result.Iva);
        Assert.Equal(0m, result.Retencion);
        Assert.Equal(totalEsperado, result.Total);
    }

    [Fact]
    public void Calculate_RedondeaAPesoEnteroConAwayFromZero()
    {
        var result = _calculator.Calculate(1_050_005m);

        Assert.Equal(199_501m, result.Iva);
    }

    [Fact]
    public void Calculate_ConservaElSubtotalOriginal()
    {
        var result = _calculator.Calculate(850_000m);

        Assert.Equal(850_000m, result.Subtotal);
    }
}
