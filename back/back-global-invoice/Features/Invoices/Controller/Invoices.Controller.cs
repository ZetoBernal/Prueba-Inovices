using back_global_invoice.Domain;
using back_global_invoice.Features.Invoices.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace back_global_invoice.Features.Invoices;

[ApiController]
[Route("api/invoices")]
[Authorize]
public class InvoicesController(IInvoiceService invoices) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InvoiceResponse>>> GetAll(CancellationToken ct) =>
        Ok(await invoices.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InvoiceResponse>> GetById(int id, CancellationToken ct)
    {
        var invoice = await invoices.GetByIdAsync(id, ct);

        return invoice is null ? NotFound() : Ok(invoice);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Operador)]
    [ProducesResponseType(typeof(InvoiceResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<InvoiceResponse>> Create(
        [FromBody] CreateInvoiceRequest request, CancellationToken ct)
    {
        var created = await invoices.CreateAsync(request, User.Identity!.Name!, ct);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}