import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';

class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() { return this.store.size; }
    clear(): void { this.store.clear(); }
    getItem(key: string): string | null { return this.store.get(key) ?? null; }
    key(index: number): string | null { return [...this.store.keys()][index] ?? null; }
    removeItem(key: string): void { this.store.delete(key); }
    setItem(key: string, value: string): void { this.store.set(key, value); }
}

Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true
});
import { LoginResponse } from '../models/user.model';
import { AuthService } from './auth.service';

function buildToken(exp: number): string {
    return `header.${btoa(JSON.stringify({ exp }))}.signature`;
}

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let router: Router;

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('no hay sesión activa si localStorage está vacío', () => {
        expect(service.isAuthenticated()).toBe(false);
        expect(service.role()).toBeNull();
    });

    it('login() envía las credenciales al endpoint correcto y guarda la sesión', () => {
        const response: LoginResponse = {
            token: 'token-de-prueba',
            username: 'operador',
            role: 'OPERADOR',
            expiresAt: new Date(Date.now() + 3_600_000).toISOString()
        };

        service.login({ username: 'operador', password: 'Operador123*' }).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        expect(req.request.method).toBe('POST');
        req.flush(response);

        expect(service.isAuthenticated()).toBe(true);
        expect(service.role()).toBe('OPERADOR');
        expect(localStorage.getItem('gi_token')).toBe('token-de-prueba');
    });

    it('logout() limpia la sesión y redirige al login', () => {
        const navigateSpy = vi.spyOn(router, 'navigate');
        localStorage.setItem('gi_token', 'x');
        localStorage.setItem('gi_user', JSON.stringify({ username: 'a', role: 'OPERADOR' }));

        service.logout();

        expect(service.isAuthenticated()).toBe(false);
        expect(localStorage.getItem('gi_token')).toBeNull();
        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('logout(false) no navega (lo usa el interceptor, que ya está en la ruta destino)', () => {
        const navigateSpy = vi.spyOn(router, 'navigate');

        service.logout(false);

        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('homeRouteForRole: AUDITOR -> dashboard, OPERADOR -> invoices', () => {
        expect(service.homeRouteForRole('AUDITOR')).toBe('/dashboard');
        expect(service.homeRouteForRole('OPERADOR')).toBe('/invoices');
    });
});

describe('AuthService - rehidratación de sesión al recargar (F5)', () => {
    afterEach(() => localStorage.clear());

    it('restaura la sesión si hay un token válido guardado', () => {
        localStorage.setItem('gi_token', buildToken(Math.floor(Date.now() / 1000) + 3600));
        localStorage.setItem('gi_user', JSON.stringify({ username: 'auditor', role: 'AUDITOR' }));

        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
        });

        const service = TestBed.inject(AuthService);

        expect(service.isAuthenticated()).toBe(true);
        expect(service.role()).toBe('AUDITOR');
    });

    it('NO restaura la sesión si el token ya venció, y limpia el storage', () => {
        localStorage.setItem('gi_token', buildToken(Math.floor(Date.now() / 1000) - 3600));
        localStorage.setItem('gi_user', JSON.stringify({ username: 'auditor', role: 'AUDITOR' }));

        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
        });

        const service = TestBed.inject(AuthService);

        expect(service.isAuthenticated()).toBe(false);
        expect(localStorage.getItem('gi_token')).toBeNull();
    });
});
