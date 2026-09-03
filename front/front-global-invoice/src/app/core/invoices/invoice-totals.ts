import { Invoice, InvoiceTypeName } from '../models/invoice.model';

export interface TypeTotal {
    type: InvoiceTypeName;
    total: number;
    count: number;
    percentage: number;
}

export function groupTotalsByType(invoices: Invoice[]): TypeTotal[] {
    const grandTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

    const grouped = new Map<InvoiceTypeName, { total: number; count: number }>();

    for (const invoice of invoices) {
        const current = grouped.get(invoice.type) ?? { total: 0, count: 0 };

        grouped.set(invoice.type, {
            total: current.total + invoice.total,
            count: current.count + 1
        });
    }

    return [...grouped.entries()]
        .map(([type, { total, count }]) => ({
            type,
            total,
            count,
            percentage: grandTotal === 0 ? 0 : (total / grandTotal) * 100
        }))
        .sort((a, b) => b.total - a.total);
}