using back_global_invoice.Domain;

namespace back_global_invoice.Taxes;

public interface ITaxCalculatorFactory
{
    ITaxCalculator For(InvoiceType type);
}

public class TaxCalculatorFactory : ITaxCalculatorFactory
{
    private readonly IReadOnlyDictionary<InvoiceType, ITaxCalculator> _calculators;

    public TaxCalculatorFactory(IEnumerable<ITaxCalculator> calculators)
    {
        _calculators = calculators.ToDictionary(calculator => calculator.Type);
    }

    public ITaxCalculator For(InvoiceType type) =>
        _calculators.TryGetValue(type, out var calculator)
            ? calculator
            : throw new NotSupportedException(
                $"No hay un cálculo tributario registrado para el tipo '{type}'.");
}