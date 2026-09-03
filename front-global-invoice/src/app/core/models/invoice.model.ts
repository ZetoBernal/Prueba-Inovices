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

export const INVOICE_TYPES = [
    { value: 1, name: 'Nacional' as const },
    { value: 2, name: 'Exportacion' as const },
    { value: 3, name: 'Gubernamental' as const }
];