import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';

import { UserRole } from '../models/user.model';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
    let authStub: { role: () => UserRole | null; homeRouteForRole: (role: UserRole) => string };

    beforeEach(() => {
        authStub = {
            role: () => null,
            homeRouteForRole: role => (role === 'AUDITOR' ? '/dashboard' : '/invoices')
        };

        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: AuthService, useValue: authStub }]
        });
    });

    function runGuard(...roles: UserRole[]) {
        const guard = roleGuard(...roles);
        return TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    }

    it('permite el acceso si el rol está entre los permitidos', () => {
        authStub.role = () => 'AUDITOR';

        expect(runGuard('AUDITOR')).toBe(true);
    });

    it('un OPERADOR que intenta /dashboard es devuelto a SU propia home, no al login', () => {
        authStub.role = () => 'OPERADOR';

        const result = runGuard('AUDITOR') as UrlTree;

        expect(result.toString()).toContain('/invoices');
    });

    it('un AUDITOR que intenta /invoices/new (crear) es devuelto a SU propia home', () => {
        authStub.role = () => 'AUDITOR';

        const result = runGuard('OPERADOR') as UrlTree;

        expect(result.toString()).toContain('/dashboard');
    });

    it('redirige a /login si no hay sesión', () => {
        authStub.role = () => null;

        const result = runGuard('AUDITOR') as UrlTree;

        expect(result.toString()).toContain('/login');
    });
});
