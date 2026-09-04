using back_global_invoice.Domain;
using back_global_invoice.Taxes;

namespace back_global_invoice.Tests.Taxes;

public class TaxCalculatorFactoryTests
{
    private readonly TaxCalculatorFactory _factory = new(
    [
        new NationalTaxCalculator(),
        new ExportTaxCalculator(),
        new GovernmentTaxCalculator()
    ]);

    [Theory]
    [InlineData(InvoiceType.Nacional, typeof(NationalTaxCalculator))]
    [InlineData(InvoiceType.Exportacion, typeof(ExportTaxCalculator))]
    [InlineData(InvoiceType.Gubernamental, typeof(GovernmentTaxCalculator))]
    public void For_ResuelveLaEstrategiaCorrectaSegunElTipo(InvoiceType type, Type esperado)
    {
        var calculator = _factory.For(type);

        Assert.IsType(esperado, calculator);
    }

    [Fact]
    public void For_LanzaSiNoHayEstrategiaRegistradaParaElTipo()
    {
        var factoriaVacia = new TaxCalculatorFactory([]);

        Assert.Throws<NotSupportedException>(() => factoriaVacia.For(InvoiceType.Nacional));
    }
}
