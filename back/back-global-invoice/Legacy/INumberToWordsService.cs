namespace back_global_invoice.Legacy;

public interface INumberToWordsService
{
    Task<string?> ConvertAsync(decimal amount, CancellationToken ct = default);
}