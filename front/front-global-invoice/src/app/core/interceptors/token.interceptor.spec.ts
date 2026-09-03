import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let authStub: { token: string | null };

    beforeEach(() => {
        authStub = { token: 'token-123' };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([tokenInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authStub }
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('agrega el header Authorization en peticiones a la propia API', () => {
        http.get(`${environment.apiUrl}/invoices`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/invoices`);
        expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
        req.flush([]);
    });

    it('NO agrega el header en peticiones a servicios externos (evita filtrar el token)', () => {
        http.get('https://servicio-externo.test/data').subscribe();

        const req = httpMock.expectOne('https://servicio-externo.test/data');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('no agrega el header si todavía no hay sesión', () => {
        authStub.token = null;

        http.get(`${environment.apiUrl}/invoices`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/invoices`);
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush([]);
    });
});
