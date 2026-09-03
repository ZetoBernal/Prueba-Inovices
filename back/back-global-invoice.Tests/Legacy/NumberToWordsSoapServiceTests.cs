using System.Net;
using back_global_invoice.Legacy;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;

namespace back_global_invoice.Tests.Legacy;

file class StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
        Task.FromResult(respond(request));
}

file class ThrowingHttpMessageHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
        throw new HttpRequestException("El servicio no respondió.");
}

public class NumberToWordsSoapServiceTests
{
    private const string ValidSoapEnvelope = """
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <m:NumberToWordsResponse xmlns:m="http://www.dataaccess.com/webservicesserver/">
              <m:NumberToWordsResult>one hundred</m:NumberToWordsResult>
            </m:NumberToWordsResponse>
          </soap:Body>
        </soap:Envelope>
        """;

    private static NumberToWordsSoapService BuildService(HttpMessageHandler handler)
    {
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://fake-dataaccess.test/") };
        var cache = new MemoryCache(new MemoryCacheOptions());

        return new NumberToWordsSoapService(httpClient, cache, NullLogger<NumberToWordsSoapService>.Instance);
    }

    [Fact]
    public async Task ConvertAsync_DevuelveElTextoCuandoElServicioResponde()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(ValidSoapEnvelope)
        });

        var result = await BuildService(handler).ConvertAsync(100m);

        Assert.Equal("one hundred", result);
    }

    [Fact]
    public async Task ConvertAsync_DevuelveNullSiElServicioLegadoNoResponde()
    {
        var service = BuildService(new ThrowingHttpMessageHandler());

        var result = await service.ConvertAsync(100m);

        Assert.Null(result);
    }

    [Fact]
    public async Task ConvertAsync_DevuelveNullParaMontosNegativos()
    {
        var service = BuildService(new ThrowingHttpMessageHandler());

        var result = await service.ConvertAsync(-1m);

        Assert.Null(result);
    }

    [Fact]
    public async Task ConvertAsync_NoVuelveALlamarElServicioParaElMismoMonto()
    {
        var llamadas = 0;

        var handler = new StubHttpMessageHandler(_ =>
        {
            llamadas++;
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(ValidSoapEnvelope) };
        });

        var service = BuildService(handler);

        await service.ConvertAsync(100m);
        await service.ConvertAsync(100m);

        Assert.Equal(1, llamadas);
    }
}
