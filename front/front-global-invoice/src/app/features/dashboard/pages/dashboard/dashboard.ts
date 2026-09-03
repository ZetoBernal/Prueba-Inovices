import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InvoiceStore } from '@core/invoices/invoice.store';
import { InvoiceTypeChart } from '../../components/invoice-type-chart/invoice-type-chart';
import { INVOICE_TYPE_COLORS, INVOICE_TYPE_LABELS } from '../../invoice-type-colors';

@Component({
    selector: 'app-dashboard',
    imports: [
        CurrencyPipe,
        DecimalPipe,
        MatCardModule,
        MatIconModule,
        MatProgressBarModule,
        InvoiceTypeChart
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
    private readonly store = inject(InvoiceStore);

    readonly totalsByType = this.store.totalsByType;
    readonly totalInvoiced = this.store.totalInvoiced;
    readonly invoiceCount = this.store.invoiceCount;
    readonly averageTicket = this.store.averageTicket;
    readonly loading = this.store.loading;
    readonly error = this.store.error;
    readonly isEmpty = this.store.isEmpty;

    readonly labels = INVOICE_TYPE_LABELS;
    readonly colors = INVOICE_TYPE_COLORS;

    constructor() {
        this.store.ensureLoaded();
    }
}
