import { Invoice } from '../models/invoice.model';
import { groupTotalsByType } from './invoice-totals';

function buildInvoice(overrides: Partial<Invoice>): Invoice {
    return {
        id: 1,
        number: 'FAC-00001',
        customerName: 'Cliente',
        type: 'Nacional',
        subtotal: 100,
        iva: 19,
        retencion: 0,
        total: 119,
        customsCode: null,
        createdAt: new Date().toISOString(),
        ...overrides
    };
}

describe('groupTotalsByType', () => {
    it('devuelve un arreglo vacío cuando no hay facturas', () => {
        expect(groupTotalsByType([])).toEqual([]);
    });

    it('agrupa una sola factura con el 100% del total', () => {
        const result = groupTotalsByType([buildInvoice({ type: 'Nacional', total: 1000 })]);

        expect(result).toEqual([
            { type: 'Nacional', total: 1000, count: 1, percentage: 100 }
        ]);
    });

    it('suma los montos y cuenta las facturas del mismo tipo', () => {
        const invoices = [
            buildInvoice({ type: 'Nacional', total: 1000 }),
            buildInvoice({ type: 'Nacional', total: 500 })
        ];

        const result = groupTotalsByType(invoices);

        expect(result).toEqual([
            { type: 'Nacional', total: 1500, count: 2, percentage: 100 }
        ]);
    });

    it('calcula el porcentaje de cada tipo sobre el total facturado', () => {
        const invoices = [
            buildInvoice({ type: 'Nacional', total: 750 }),
            buildInvoice({ type: 'Exportacion', total: 250 })
        ];

        const result = groupTotalsByType(invoices);

        const nacional = result.find(r => r.type === 'Nacional');
        const exportacion = result.find(r => r.type === 'Exportacion');

        expect(nacional?.percentage).toBe(75);
        expect(exportacion?.percentage).toBe(25);
    });

    it('ordena los grupos de mayor a menor monto', () => {
        const invoices = [
            buildInvoice({ type: 'Nacional', total: 100 }),
            buildInvoice({ type: 'Gubernamental', total: 900 }),
            buildInvoice({ type: 'Exportacion', total: 500 })
        ];

        const result = groupTotalsByType(invoices);

        expect(result.map(r => r.type)).toEqual(['Gubernamental', 'Exportacion', 'Nacional']);
    });

    it('no revienta si el total facturado es cero', () => {
        const invoices = [buildInvoice({ type: 'Exportacion', total: 0 })];

        const result = groupTotalsByType(invoices);

        expect(result[0].percentage).toBe(0);
    });
});
