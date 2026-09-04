import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InvoiceApiService } from '@core/invoices/invoice-api.service';
import { InvoiceDetail } from '@core/models/invoice.model';

export interface InvoiceDetailDialogData {
    invoiceId: number;
}

@Component({
    selector: 'app-invoice-detail-dialog',
    imports: [
        CurrencyPipe,
        DatePipe,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatProgressBarModule
    ],
    templateUrl: './invoice-detail-dialog.html',
    styleUrl: './invoice-detail-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailDialog {
    private readonly api = inject(InvoiceApiService);
    private readonly data = inject<InvoiceDetailDialogData>(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<InvoiceDetailDialog>);

    readonly loading = signal(true);
    readonly error = signal<string | null>(null);
    readonly invoice = signal<InvoiceDetail | null>(null);

    constructor() {
        this.api.getById(this.data.invoiceId).subscribe({
            next: detail => {
                this.invoice.set(detail);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudo cargar el detalle de la factura.');
                this.loading.set(false);
            }
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
