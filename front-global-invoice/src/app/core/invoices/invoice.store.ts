import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { CreateInvoiceRequest, Invoice } from '../models/invoice.model';
import { InvoiceApiService } from './invoice-api.service';
import { groupTotalsByType } from './invoice-totals';

@Injectable({ providedIn: 'root' })
export class InvoiceStore {
    private readonly api = inject(InvoiceApiService);

    private readonly _invoices = signal<Invoice[]>([]);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    private loaded = false;

    readonly invoices = this._invoices.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly isEmpty = computed(() => !this._loading() && this._invoices().length === 0);

    readonly totalsByType = computed(() => groupTotalsByType(this._invoices()));
    readonly totalInvoiced = computed(() => this._invoices().reduce((sum, invoice) => sum + invoice.total, 0));
    readonly invoiceCount = computed(() => this._invoices().length);
    readonly averageTicket = computed(() => {
        const count = this.invoiceCount();
        return count === 0 ? 0 : this.totalInvoiced() / count;
    });

    ensureLoaded(): void {
        if (this.loaded || this._loading()) return;

        this._loading.set(true);
        this._error.set(null);

        this.api.getAll().subscribe({
        next: invoices => {
            this._invoices.set(invoices);
            this.loaded = true;
            this._loading.set(false);
        },
        error: () => {
            this._error.set('No se pudieron cargar las facturas.');
            this._loading.set(false);
        }
        });
    }

    addInvoice(invoice: Invoice): void {
        this._invoices.update(current => [invoice, ...current]);
    }

    create(request: CreateInvoiceRequest): Observable<Invoice> {
        return this.api.create(request).pipe(tap(invoice => this.addInvoice(invoice)));
    }

    reload(): void {
        this.loaded = false;
        this.ensureLoaded();
    }

    clear(): void {
        this._invoices.set([]);
        this.loaded = false;
    }
}