import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { Invoice } from '../models/invoice.model';
import { InvoiceApiService } from './invoice-api.service';
import { InvoiceStore } from './invoice.store';

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

describe('InvoiceStore', () => {
    let apiStub: { getAll: () => Observable<Invoice[]>; create: (r: unknown) => Observable<Invoice> };
    let store: InvoiceStore;

    beforeEach(() => {
        apiStub = {
            getAll: () => of([buildInvoice({ id: 1, total: 100 })]),
            create: () => of(buildInvoice({ id: 2, total: 200, customerName: 'Nueva' }))
        };

        TestBed.configureTestingModule({
            providers: [{ provide: InvoiceApiService, useValue: apiStub }]
        });

        store = TestBed.inject(InvoiceStore);
    });

    it('ensureLoaded() carga las facturas la primera vez', () => {
        store.ensureLoaded();

        expect(store.invoices().length).toBe(1);
        expect(store.loading()).toBe(false);
        expect(store.isEmpty()).toBe(false);
    });

    it('ensureLoaded() NO vuelve a pedir si ya se cargó antes (RF-04)', () => {
        const getAllSpy = vi.spyOn(apiStub, 'getAll');

        store.ensureLoaded();
        store.ensureLoaded();
        store.ensureLoaded();

        expect(getAllSpy).toHaveBeenCalledTimes(1);
    });

    it('addInvoice() agrega la factura al principio, sin pedir la lista de nuevo', () => {
        store.ensureLoaded();

        store.addInvoice(buildInvoice({ id: 99, customerName: 'Recién creada' }));

        expect(store.invoices()[0].customerName).toBe('Recién creada');
        expect(store.invoices().length).toBe(2);
    });

    it('create() llama a la API y agrega el resultado al store (lo usa el formulario de crear)', () => {
        store.ensureLoaded();

        store.create({ customerName: 'Nueva', type: 1, subtotal: 200 }).subscribe();

        expect(store.invoices().length).toBe(2);
        expect(store.invoices()[0].customerName).toBe('Nueva');
    });

    it('totalInvoiced, invoiceCount y averageTicket se derivan del signal (RF-04)', () => {
        store.ensureLoaded();
        store.addInvoice(buildInvoice({ id: 2, total: 300 }));

        expect(store.invoiceCount()).toBe(2);
        expect(store.totalInvoiced()).toBe(400);
        expect(store.averageTicket()).toBe(200);
    });

    it('totalsByType agrupa correctamente (alimenta la gráfica del dashboard)', () => {
        store.ensureLoaded();
        store.addInvoice(buildInvoice({ id: 2, type: 'Exportacion', total: 300 }));

        const totals = store.totalsByType();

        expect(totals.find(t => t.type === 'Nacional')?.total).toBe(100);
        expect(totals.find(t => t.type === 'Exportacion')?.total).toBe(300);
    });

    it('establece un mensaje de error si la carga inicial falla', () => {
        apiStub.getAll = () => throwError(() => new Error('fail'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [{ provide: InvoiceApiService, useValue: apiStub }]
        });
        const failingStore = TestBed.inject(InvoiceStore);

        failingStore.ensureLoaded();

        expect(failingStore.error()).toBeTruthy();
        expect(failingStore.loading()).toBe(false);
    });

    it('clear() vacía el estado y permite volver a cargar', () => {
        store.ensureLoaded();
        store.clear();

        expect(store.invoices()).toEqual([]);

        const getAllSpy = vi.spyOn(apiStub, 'getAll');
        store.ensureLoaded();

        expect(getAllSpy).toHaveBeenCalledTimes(1);
    });
});
