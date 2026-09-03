import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from '../auth/auth.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let authStub: { logout: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authStub = { logout: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authStub }
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('cierra la sesión ante un 401 en un endpoint que no es el login', () => {
        http.get('/api/invoices').subscribe({ error: () => {} });

        httpMock.expectOne('/api/invoices').flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(authStub.logout).toHaveBeenCalled();
    });

    it('NO cierra la sesión ante un 401 del propio login (serían credenciales malas)', () => {
        http.post('/api/auth/login', {}).subscribe({ error: () => {} });

        httpMock.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(authStub.logout).not.toHaveBeenCalled();
    });

    it('un 403 NO cierra la sesión (el token es válido, solo falta el rol)', () => {
        http.get('/api/invoices').subscribe({ error: () => {} });

        httpMock.expectOne('/api/invoices').flush(null, { status: 403, statusText: 'Forbidden' });

        expect(authStub.logout).not.toHaveBeenCalled();
    });
});
