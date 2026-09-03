import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { AuthService } from '../../../../core/auth/auth.service';
import { InvoiceStore } from '../../../../core/invoices/invoice.store';

@Component({
    selector: 'app-invoice-list',
    imports: [
            CurrencyPipe,
            DatePipe,
            RouterLink,
            MatButtonModule,
            MatCardModule,
            MatChipsModule,
            MatIconModule,
            MatProgressBarModule,
            MatTableModule
        ],
    templateUrl: './invoice-list.html',
    styleUrl: './invoice-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoiceList {
    private readonly store = inject(InvoiceStore);
    private readonly auth = inject(AuthService);

    readonly invoices = this.store.invoices;
    readonly loading = this.store.loading;
    readonly error = this.store.error;
    readonly isEmpty = this.store.isEmpty;

    readonly canCreate = computed(() => this.auth.role() === 'OPERADOR');

    readonly columns = ['number', 'customerName', 'type', 'subtotal', 'total', 'createdAt', 'actions'];

    constructor() {
        this.store.ensureLoaded();
    }
}