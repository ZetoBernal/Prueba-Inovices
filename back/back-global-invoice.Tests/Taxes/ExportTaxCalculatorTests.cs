using back_global_invoice.Domain;
using back_global_invoice.Taxes;

namespace back_global_invoice.Tests.Taxes;

public class ExportTaxCalculatorTests
{
    private readonly ExportTaxCalculator _calculator = new();

    [Fact]
    public void Type_EsExportacion()
    {
        Assert.Equal(InvoiceType.Exportacion, _calculator.Type);
    }

    [Theory]
    [InlineData(8_400_000)]
    [InlineData(1)]
    [InlineData(0)]
    public void Calculate_NoAplicaIvaNiRetencion(decimal subtotal)
    {
        var result = _calculator.Calculate(subtotal);

        Assert.Equal(0m, result.Iva);
        Assert.Equal(0m, result.Retencion);
        Assert.Equal(subtotal, result.Total);
    }
}
