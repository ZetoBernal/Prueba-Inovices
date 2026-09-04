import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateInvoiceRequest, Invoice, InvoiceDetail } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/invoices`;

    getAll(): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(this.baseUrl);
    }

    getById(id: number): Observable<InvoiceDetail> {
        return this.http.get<InvoiceDetail>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateInvoiceRequest): Observable<Invoice> {
        return this.http.post<Invoice>(this.baseUrl, request);
    }
}