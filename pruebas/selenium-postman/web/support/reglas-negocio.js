/**
 * Oráculo de prueba: reglas de tributación del sistema (README del proyecto,
 * carpeta Taxes/ del backend). Las pruebas calculan el valor esperado aquí y
 * lo comparan con lo que muestra la interfaz.
 */
const IVA = 0.19;
const RETENCION = 0.05;

/** Redondeo "away from zero", igual que MidpointRounding.AwayFromZero en .NET. */
const redondear = valor => Math.sign(valor) * Math.round(Math.abs(valor));

function calcularTotal(tipoEnTabla, subtotal) {
    switch (tipoEnTabla) {
        case 'Nacional':
            return subtotal + redondear(subtotal * IVA);
        case 'Exportacion':
            return subtotal;
        case 'Gubernamental':
            return subtotal + redondear(subtotal * IVA) - redondear(subtotal * RETENCION);
        default:
            throw new Error(`Tipo de factura desconocido: ${tipoEnTabla}`);
    }
}

/** Convierte un texto de moneda ("$1,785,000" o "$ 1.785.000") en número. */
const aNumero = textoMoneda => Number(String(textoMoneda).replace(/[^\d]/g, ''));

module.exports = { calcularTotal, aNumero };
