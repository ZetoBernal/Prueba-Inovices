package pruebas.globalinvoice.soporte;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Oráculo de prueba: reglas de tributación de Global Invoice (README del proyecto y
 * carpeta Taxes/ del backend). Las pruebas calculan aquí el valor esperado y lo comparan
 * con lo que devuelve la API o muestra la interfaz, sin copiar la lógica de la aplicación.
 */
public final class ReglasNegocio {

    private static final BigDecimal IVA = new BigDecimal("0.19");
    private static final BigDecimal RETENCION = new BigDecimal("0.05");

    private ReglasNegocio() {
    }

    /** Resultado del cálculo de impuestos de una factura. */
    public record Impuestos(BigDecimal iva, BigDecimal retencion, BigDecimal total) {
    }

    /**
     * Calcula IVA, retención y total según el tipo de factura.
     * HALF_UP en Java equivale a MidpointRounding.AwayFromZero de .NET para valores positivos.
     *
     * @param tipo     1 = Nacional, 2 = Exportación, 3 = Gubernamental
     * @param subtotal valor antes de impuestos
     */
    public static Impuestos calcular(int tipo, BigDecimal subtotal) {
        BigDecimal iva = BigDecimal.ZERO;
        BigDecimal retencion = BigDecimal.ZERO;
        switch (tipo) {
            case 1 -> iva = redondear(subtotal.multiply(IVA));
            case 2 -> { /* exportación: exenta */ }
            case 3 -> {
                iva = redondear(subtotal.multiply(IVA));
                retencion = redondear(subtotal.multiply(RETENCION));
            }
            default -> throw new IllegalArgumentException("Tipo de factura desconocido: " + tipo);
        }
        return new Impuestos(iva, retencion, subtotal.add(iva).subtract(retencion));
    }

    /** Traduce el nombre que muestra la tabla del front al código del tipo. */
    public static int tipoDesdeNombre(String nombre) {
        return switch (nombre) {
            case "Nacional" -> 1;
            case "Exportacion", "Exportación" -> 2;
            case "Gubernamental" -> 3;
            default -> throw new IllegalArgumentException("Tipo de factura desconocido: " + nombre);
        };
    }

    /** Convierte un texto de moneda ("$1,785,000" o "$ 1.785.000") en número. */
    public static BigDecimal aNumero(String textoMoneda) {
        String digitos = textoMoneda.replaceAll("[^0-9]", "");
        return digitos.isEmpty() ? BigDecimal.ZERO : new BigDecimal(digitos);
    }

    private static BigDecimal redondear(BigDecimal valor) {
        return valor.setScale(0, RoundingMode.HALF_UP);
    }
}
