using back_global_invoice.Data;
using back_global_invoice.Domain;
using back_global_invoice.Features.Invoices;
using back_global_invoice.Features.Invoices.Dtos;
using back_global_invoice.Legacy;
using back_global_invoice.Taxes;
using Microsoft.EntityFrameworkCore;

namespace back_global_invoice.Tests.Invoices;

// Doble de prueba: aísla el servicio del SOAP real (RNF-02: el frontend ni
// siquiera sabe que existe; aquí tampoco necesitamos que exista de verdad).
file class FakeNumberToWordsService(string? result = "test words") : INumberToWordsService
{
    public Task<string?> ConvertAsync(decimal amount, CancellationToken ct = default) =>
        Task.FromResult(result);
}

public class InvoiceServiceTests
{
    private static InvoiceService BuildService(string? wordsResult = "test words")
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);

        var taxFactory = new TaxCalculatorFactory(
        [
            new NationalTaxCalculator(),
            new ExportTaxCalculator(),
            new GovernmentTaxCalculator()
        ]);

        return new InvoiceService(db, taxFactory, new FakeNumberToWordsService(wordsResult));
    }

    [Fact]
    public async Task CreateAsync_CalculaLosImpuestosSegunElTipoUsandoElMotorReal()
    {
        var service = BuildService();

        var result = await service.CreateAsync(new CreateInvoiceRequest
        {
            CustomerName = "Cliente Gubernamental",
            Type = InvoiceType.Gubernamental,
            Subtotal = 1_000_000m
        }, "operador");

        Assert.Equal(190_000m, result.Iva);
        Assert.Equal(50_000m, result.Retencion);
        Assert.Equal(1_140_000m, result.Total);
    }

    [Fact]
    public async Task CreateAsync_DescartaElCodigoAduaneroSiElTipoNoEsExportacion()
    {
        var service = BuildService();

        // Aunque el cliente lo mande, el backend no confía en el payload:
        // solo persiste el código aduanero cuando el tipo es Exportación.
        var result = await service.CreateAsync(new CreateInvoiceRequest
        {
            CustomerName = "Cliente Nacional",
            Type = InvoiceType.Nacional,
            Subtotal = 100_000m,
            CustomsCode = "ADU-999"
        }, "operador");

        Assert.Null(result.CustomsCode);
    }

    [Fact]
    public async Task CreateAsync_ConservaElCodigoAduaneroCuandoElTipoEsExportacion()
    {
        var service = BuildService();

        var result = await service.CreateAsync(new CreateInvoiceRequest
        {
            CustomerName = "Exportadora",
            Type = InvoiceType.Exportacion,
            Subtotal = 100_000m,
            CustomsCode = "ADU-123"
        }, "operador");

        Assert.Equal("ADU-123", result.CustomsCode);
        Assert.Equal(0m, result.Iva);
        Assert.Equal(100_000m, result.Total);
    }

    [Fact]
    public async Task CreateAsync_GeneraConsecutivosCorrelativos()
    {
        var service = BuildService();

        var primera = await service.CreateAsync(
            new CreateInvoiceRequest { CustomerName = "A", Type = InvoiceType.Nacional, Subtotal = 100m },
            "operador");
        var segunda = await service.CreateAsync(
            new CreateInvoiceRequest { CustomerName = "B", Type = InvoiceType.Nacional, Subtotal = 100m },
            "operador");

        Assert.Equal("FAC-00001", primera.Number);
        Assert.Equal("FAC-00002", segunda.Number);
    }

    [Fact]
    public async Task GetByIdAsync_DevuelveNullSiLaFacturaNoExiste()
    {
        var service = BuildService();

        var result = await service.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_IncluyeElTotalEnLetrasDelServicioLegado()
    {
        var service = BuildService(wordsResult: "one hundred");

        var created = await service.CreateAsync(
            new CreateInvoiceRequest { CustomerName = "Cliente", Type = InvoiceType.Nacional, Subtotal = 100m },
            "operador");

        var detail = await service.GetByIdAsync(created.Id);

        Assert.NotNull(detail);
        Assert.Equal("one hundred", detail.TotalInWords);
    }

    [Fact]
    public async Task GetByIdAsync_NoRompeSiElServicioSoapNoRespondio()
    {
        // RF-03: si el sistema legado falla, la factura se sigue mostrando,
        // solo con el total en letras en null.
        var service = BuildService(wordsResult: null);

        var created = await service.CreateAsync(
            new CreateInvoiceRequest { CustomerName = "Cliente", Type = InvoiceType.Nacional, Subtotal = 100m },
            "operador");

        var detail = await service.GetByIdAsync(created.Id);

        Assert.NotNull(detail);
        Assert.Null(detail.TotalInWords);
        Assert.Equal(created.Total, detail.Total);
    }

    [Fact]
    public async Task GetAllAsync_DevuelveLasFacturasOrdenadasPorFechaDescendente()
    {
        var service = BuildService();

        await service.CreateAsync(
            new CreateInvoiceRequest { CustomerName = "Primera", Type = InvoiceType.Nacional, Subtotal = 100m },
            "operador");
        await service.CreateAsync(
            new CreateInvoiceRequest { CustomerName = "Segunda", Type = InvoiceType.Nacional, Subtotal = 100m },
            "operador");

        var all = await service.GetAllAsync();

        Assert.Equal(2, all.Count);
        Assert.Equal("Segunda", all[0].CustomerName);
    }
}
