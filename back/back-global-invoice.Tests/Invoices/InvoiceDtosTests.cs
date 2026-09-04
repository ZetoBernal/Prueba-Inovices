using back_global_invoice.Features.Invoices.Dtos;

namespace back_global_invoice.Tests.Invoices;

public class InvoiceDtosTests
{
    [Fact]
    public void InvoiceResponse_EsIgualPorValorNoPorReferencia()
    {
        var fecha = DateTime.UtcNow;

        var a = new InvoiceResponse(1, "FAC-00001", "Cliente", "Nacional", 100, 19, 0, 119, null, fecha);
        var b = new InvoiceResponse(1, "FAC-00001", "Cliente", "Nacional", 100, 19, 0, 119, null, fecha);

        Assert.Equal(a, b);
        Assert.False(ReferenceEquals(a, b));
    }

    [Fact]
    public void InvoiceDetailResponse_ExponeElTotalEnLetras()
    {
        var detail = new InvoiceDetailResponse(
            1, "FAC-00001", "Cliente", "Nacional", 100, 19, 0, 119, null, DateTime.UtcNow, "one hundred nineteen");

        Assert.Equal("one hundred nineteen", detail.TotalInWords);
    }
}
