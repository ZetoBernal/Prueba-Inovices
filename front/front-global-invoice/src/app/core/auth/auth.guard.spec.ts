import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
    let authStub: { isAuthenticated: () => boolean };

    beforeEach(() => {
        authStub = { isAuthenticated: () => false };

        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: AuthService, useValue: authStub }]
        });
    });

    function runGuard(url = '/invoices') {
        return TestBed.runInInjectionContext(() =>
            authGuard({} as never, { url } as never)
        );
    }

    it('permite el acceso si hay sesión activa', () => {
        authStub.isAuthenticated = () => true;

        expect(runGuard()).toBe(true);
    });

    it('redirige a /login si no hay sesión', () => {
        const result = runGuard() as UrlTree;

        expect(result).toBeInstanceOf(UrlTree);
        expect(result.toString()).toContain('/login');
    });

    it('conserva la URL original como returnUrl al redirigir', () => {
        const result = runGuard('/invoices/new') as UrlTree;

        expect(result.toString()).toContain('returnUrl');
        expect(result.toString()).toContain('invoices');
    });
});
