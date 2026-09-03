namespace back_global_invoice.Domain;

public class Invoice
{
    public int Id { get; set; }
    public string Number { get; set; } = null!;
    public string CustomerName { get; set; } = null!;
    public InvoiceType Type { get; set; }

    public decimal Subtotal { get; set; }
    public decimal Iva { get; set; }
    public decimal Retencion { get; set; }
    public decimal Total { get; set; }

    public string? CustomsCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
}