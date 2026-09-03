using System.Security.Claims;
using back_global_invoice.Domain;
using back_global_invoice.Features.Invoices;
using back_global_invoice.Features.Invoices.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace back_global_invoice.Tests.Controllers;

/// <summary>
/// Doble de prueba: el controller no necesita saber cómo se calculan los
/// impuestos ni cómo se persiste la factura, solo delega en la interfaz.
/// </summary>
class FakeInvoiceService : IInvoiceService
{
    public InvoiceResponse? CreateResult { get; set; }
    public IReadOnlyList<InvoiceResponse> AllResult { get; set; } = [];
    public InvoiceDetailResponse? DetailResult { get; set; }

    public Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request, string username, CancellationToken ct = default) =>
        Task.FromResult(CreateResult!);

    public Task<IReadOnlyList<InvoiceResponse>> GetAllAsync(CancellationToken ct = default) =>
        Task.FromResult(AllResult);

    public Task<InvoiceDetailResponse?> GetByIdAsync(int id, CancellationToken ct = default) =>
        Task.FromResult(DetailResult);
}

public class InvoicesControllerTests
{
    private static InvoicesController BuildController(FakeInvoiceService service, string username = "operador")
    {
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Name, username)], "TestAuth");

        return new InvoicesController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            }
        };
    }

    [Fact]
    public async Task GetAll_DevuelveOkConLaListaDeFacturas()
    {
        var service = new FakeInvoiceService
        {
            AllResult = [new InvoiceResponse(1, "FAC-00001", "Cliente", "Nacional", 100, 19, 0, 119, null, DateTime.UtcNow)]
        };

        var result = await BuildController(service).GetAll(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var invoices = Assert.IsAssignableFrom<IReadOnlyList<InvoiceResponse>>(ok.Value);
        Assert.Single(invoices);
    }

    [Fact]
    public async Task GetById_DevuelveNotFoundSiLaFacturaNoExiste()
    {
        var service = new FakeInvoiceService { DetailResult = null };

        var result = await BuildController(service).GetById(999, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetById_DevuelveOkConElDetalleSiExiste()
    {
        var detail = new InvoiceDetailResponse(
            1, "FAC-00001", "Cliente", "Nacional", 100, 19, 0, 119, null, DateTime.UtcNow, "one hundred nineteen");

        var service = new FakeInvoiceService { DetailResult = detail };

        var result = await BuildController(service).GetById(1, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(detail, ok.Value);
    }

    [Fact]
    public async Task Create_DevuelveCreatedAtActionApuntandoAGetById()
    {
        var created = new InvoiceResponse(5, "FAC-00005", "Cliente Nuevo", "Nacional", 100, 19, 0, 119, null, DateTime.UtcNow);
        var service = new FakeInvoiceService { CreateResult = created };

        var request = new CreateInvoiceRequest { CustomerName = "Cliente Nuevo", Type = InvoiceType.Nacional, Subtotal = 100 };

        var result = await BuildController(service, username: "operador").Create(request, CancellationToken.None);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(InvoicesController.GetById), createdResult.ActionName);
        Assert.Equal(created, createdResult.Value);
    }
}
