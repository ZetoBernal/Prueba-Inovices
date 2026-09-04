import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { InvoiceStore } from '@core/invoices/invoice.store';
import { CreateInvoiceRequest, INVOICE_TYPE_OPTIONS } from '@core/models/invoice.model';

const EXPORT_TYPE_VALUE = 2;

type InvoiceFormGroup = FormGroup<{
    customerName: FormControl<string>;
    type: FormControl<number | null>;
    subtotal: FormControl<number | null>;
    customsCode?: FormControl<string>;
}>;

@Component({
    selector: 'app-invoice-create',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule
    ],
    templateUrl: './invoice-create.html',
    styleUrl: './invoice-create.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceCreate {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly store = inject(InvoiceStore);
    private readonly router = inject(Router);

    readonly invoiceTypes = INVOICE_TYPE_OPTIONS;

    readonly submitting = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly showCustomsCode = signal(false);

    readonly form: InvoiceFormGroup = this.fb.group({
        customerName: this.fb.control('', [Validators.required, Validators.maxLength(150)]),
        type: this.fb.control<number | null>(null, Validators.required),
        subtotal: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)])
    });

    constructor() {
        this.form.controls.type.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(type => this.syncCustomsCodeControl(type));
    }

    submit(): void {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.errorMessage.set(null);

        const value = this.form.getRawValue();

        const request: CreateInvoiceRequest = {
            customerName: value.customerName,
            type: value.type!,
            subtotal: value.subtotal!,
            ...(this.showCustomsCode() ? { customsCode: value.customsCode } : {})
        };

        this.store.create(request).subscribe({
            next: () => this.router.navigateByUrl('/invoices'),
            error: (error: HttpErrorResponse) => {
                this.submitting.set(false);
                this.errorMessage.set(this.messageFor(error));
            }
        });
    }

    cancel(): void {
        this.router.navigateByUrl('/invoices');
    }

    private syncCustomsCodeControl(type: number | null): void {
        const isExport = type === EXPORT_TYPE_VALUE;

        if (isExport && !this.form.contains('customsCode')) {
            this.form.addControl(
                'customsCode',
                this.fb.control('', [Validators.required, Validators.maxLength(30)])
            );
        } else if (!isExport && this.form.contains('customsCode')) {
            this.form.removeControl('customsCode');
        }

        this.showCustomsCode.set(isExport);
    }

    private messageFor(error: HttpErrorResponse): string {
        if (error.status === 0) return 'No se pudo conectar con el servidor.';

        const validationErrors = error.error?.errors as Record<string, string[]> | undefined;

        if (validationErrors) {
            return Object.values(validationErrors).flat().join(' ');
        }

        return 'No se pudo crear la factura. Intenta nuevamente.';
    }
}
