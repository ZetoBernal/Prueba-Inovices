using System.ComponentModel.DataAnnotations;
using back_global_invoice.Domain;
using back_global_invoice.Features.Invoices.Dtos;

namespace back_global_invoice.Tests.Invoices;

public class CreateInvoiceRequestTests
{
    private static IList<ValidationResult> Validate(CreateInvoiceRequest request)
    {
        var context = new ValidationContext(request);
        var results = new List<ValidationResult>();

        Validator.TryValidateObject(request, context, results, validateAllProperties: true);

        return results;
    }

    [Fact]
    public void Exportacion_SinCodigoAduanero_EsInvalida()
    {
        var request = new CreateInvoiceRequest
        {
            CustomerName = "Cliente",
            Type = InvoiceType.Exportacion,
            Subtotal = 1000m,
            CustomsCode = null
        };

        var results = Validate(request);

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateInvoiceRequest.CustomsCode)));
    }

    [Fact]
    public void Exportacion_ConCodigoAduanero_EsValida()
    {
        var request = new CreateInvoiceRequest
        {
            CustomerName = "Cliente",
            Type = InvoiceType.Exportacion,
            Subtotal = 1000m,
            CustomsCode = "ADU-001"
        };

        var results = Validate(request);

        Assert.Empty(results);
    }

    [Theory]
    [InlineData(InvoiceType.Nacional)]
    [InlineData(InvoiceType.Gubernamental)]
    public void TiposDistintosDeExportacion_NoExigenCodigoAduanero(InvoiceType type)
    {
        var request = new CreateInvoiceRequest
        {
            CustomerName = "Cliente",
            Type = type,
            Subtotal = 1000m,
            CustomsCode = null
        };

        var results = Validate(request);

        Assert.Empty(results);
    }
}
