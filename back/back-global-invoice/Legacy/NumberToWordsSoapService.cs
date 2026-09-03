using System.Net.Http.Headers;
using System.Text;
using System.Xml.Linq;
using Microsoft.Extensions.Caching.Memory;

namespace back_global_invoice.Legacy;

public class NumberToWordsSoapService(
    HttpClient http,
    IMemoryCache cache,
    ILogger<NumberToWordsSoapService> logger) : INumberToWordsService
{
    private const string ServiceNamespace = "http://www.dataaccess.com/webservicesserver/";

    public async Task<string?> ConvertAsync(decimal amount, CancellationToken ct = default)
    {
        if (amount < 0) return null;

        var whole = (ulong)decimal.Truncate(amount);

        if (cache.TryGetValue(CacheKey(whole), out string? cached)) return cached;

        try
        {
            var words = await CallServiceAsync(whole, ct);

            if (!string.IsNullOrWhiteSpace(words))
            {
                cache.Set(CacheKey(whole), words, TimeSpan.FromHours(24));
            }

            return words;
        }
        catch (Exception ex) when (ex is HttpRequestException
                                      or TaskCanceledException
                                      or System.Xml.XmlException)
        {
            logger.LogWarning(ex, "El servicio SOAP de conversión no respondió para el monto {Amount}.", amount);

            return null;
        }
    }

    private async Task<string?> CallServiceAsync(ulong number, CancellationToken ct)
    {
        var envelope = $"""
            <?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <NumberToWords xmlns="{ServiceNamespace}">
                  <ubiNum>{number}</ubiNum>
                </NumberToWords>
              </soap:Body>
            </soap:Envelope>
            """;

        using var content = new StringContent(envelope, Encoding.UTF8);
        content.Headers.ContentType = new MediaTypeHeaderValue("text/xml") { CharSet = "utf-8" };

        using var request = new HttpRequestMessage(HttpMethod.Post, string.Empty) { Content = content };
        request.Headers.Add("SOAPAction", "\"\"");

        using var response = await http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var xml = await response.Content.ReadAsStringAsync(ct);

        var result = XDocument.Parse(xml)
            .Descendants(XName.Get("NumberToWordsResult", ServiceNamespace))
            .FirstOrDefault()?.Value.Trim();

        return string.IsNullOrWhiteSpace(result) ? null : result;
    }

    private static string CacheKey(ulong number) => $"number-to-words:{number}";
}