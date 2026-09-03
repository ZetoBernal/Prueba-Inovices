import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { InvoiceApiService } from './invoice-api.service';

describe('InvoiceApiService', () => {
    let service: InvoiceApiService;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/invoices`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });

        service = TestBed.inject(InvoiceApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('getAll() hace GET a /invoices', () => {
        service.getAll().subscribe();

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('getById() hace GET a /invoices/:id', () => {
        service.getById(7).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/7`);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('create() hace POST a /invoices con el cuerpo exacto de la solicitud', () => {
        const request = { customerName: 'Cliente', type: 1, subtotal: 1000 };

        service.create(request).subscribe();

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(request);
        req.flush({});
    });
});
