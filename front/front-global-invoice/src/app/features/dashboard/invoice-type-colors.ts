import { InvoiceTypeName } from '@core/models/invoice.model';

export const INVOICE_TYPE_COLORS: Record<InvoiceTypeName, string> = {
    Nacional: '#3b6fd4',
    Exportacion: '#2e9e63',
    Gubernamental: '#e0873a'
};

export const INVOICE_TYPE_LABELS: Record<InvoiceTypeName, string> = {
    Nacional: 'Nacional',
    Exportacion: 'Exportación',
    Gubernamental: 'Gubernamental'
};
