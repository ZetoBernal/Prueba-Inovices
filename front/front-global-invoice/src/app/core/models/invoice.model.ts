export type InvoiceTypeName = 'Nacional' | 'Exportacion' | 'Gubernamental';

export interface Invoice {
    id: number;
    number: string;
    customerName: string;
    type: InvoiceTypeName;
    subtotal: number;
    iva: number;
    retencion: number;
    total: number;
    customsCode: string | null;
    createdAt: string;
}

export interface InvoiceDetail extends Invoice {
    totalInWords: string | null;
}

export interface CreateInvoiceRequest {
    customerName: string;
    type: number;
    subtotal: number;
    customsCode?: string;
}

export const INVOICE_TYPE_OPTIONS: ReadonlyArray<{ value: number; name: InvoiceTypeName; label: string }> = [
    { value: 1, name: 'Nacional', label: 'Nacional' },
    { value: 2, name: 'Exportacion', label: 'Exportación' },
    { value: 3, name: 'Gubernamental', label: 'Gubernamental' }
];