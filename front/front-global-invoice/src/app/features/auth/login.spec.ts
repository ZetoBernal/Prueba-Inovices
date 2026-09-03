import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { Login } from './login';

describe('Login (componente)', () => {
    let fixture: ComponentFixture<Login>;
    let component: Login;
    let authStub: { login: ReturnType<typeof vi.fn>; homeRouteForRole: ReturnType<typeof vi.fn> };
    let navigateByUrlSpy: ReturnType<typeof vi.fn>;

    function configure(returnUrl: string | null = null) {
        TestBed.resetTestingModule();

        authStub = {
            login: vi.fn(),
            homeRouteForRole: vi.fn((role: string) => (role === 'AUDITOR' ? '/dashboard' : '/invoices'))
        };
        navigateByUrlSpy = vi.fn();

        TestBed.configureTestingModule({
            imports: [Login],
            providers: [
                { provide: AuthService, useValue: authStub },
                { provide: Router, useValue: { navigateByUrl: navigateByUrlSpy } },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}) }
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(Login);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    beforeEach(() => configure());

    it('arranca con el formulario vacío e inválido', () => {
        expect(component.form.invalid).toBe(true);
    });

    it('renderiza los campos de usuario, contraseña y el botón de enviar', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('input[formControlName="username"]')).toBeTruthy();
        expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
        expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    });

    it('no llama a auth.login si el formulario es inválido', () => {
        component.submit();

        expect(authStub.login).not.toHaveBeenCalled();
        expect(component.form.touched).toBe(true);
    });

    it('con credenciales válidas, llama a auth.login y navega a la home del rol', () => {
        authStub.login.mockReturnValue(of({ token: 't', username: 'operador', role: 'OPERADOR', expiresAt: '' }));

        component.form.setValue({ username: 'operador', password: 'Operador123*' });
        component.submit();

        expect(authStub.login).toHaveBeenCalledWith({ username: 'operador', password: 'Operador123*' });
        expect(navigateByUrlSpy).toHaveBeenCalledWith('/invoices');
    });

    it('muestra el mensaje de error en el HTML si las credenciales son incorrectas', () => {
        authStub.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

        component.form.setValue({ username: 'x', password: 'incorrecta' });
        component.submit();
        fixture.detectChanges();

        expect(component.loading()).toBe(false);

        const message = fixture.nativeElement.querySelector('.login-error')?.textContent;
        expect(message).toContain('incorrectos');
    });

    it('muestra un mensaje distinto si el servidor no responde (status 0)', () => {
        authStub.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

        component.form.setValue({ username: 'x', password: 'incorrecta' });
        component.submit();

        expect(component.errorMessage()).toBe('No se pudo conectar con el servidor.');
    });

    it('respeta un returnUrl interno válido tras el login', () => {
        configure('/dashboard');
        authStub.login.mockReturnValue(of({ token: 't', username: 'auditor', role: 'AUDITOR', expiresAt: '' }));

        component.form.setValue({ username: 'auditor', password: 'Auditor123*' });
        component.submit();

        expect(navigateByUrlSpy).toHaveBeenCalledWith('/dashboard');
    });

    it('ignora un returnUrl externo, protegiendo contra open redirect', () => {
        configure('//sitio-malo.com');
        authStub.login.mockReturnValue(of({ token: 't', username: 'operador', role: 'OPERADOR', expiresAt: '' }));

        component.form.setValue({ username: 'operador', password: 'Operador123*' });
        component.submit();

        expect(navigateByUrlSpy).toHaveBeenCalledWith('/invoices');
        expect(navigateByUrlSpy).not.toHaveBeenCalledWith('//sitio-malo.com');
    });

    it('fillCredentials() rellena el formulario (botones de acceso de prueba)', () => {
        component.fillCredentials('auditor', 'Auditor123*');

        expect(component.form.value).toEqual({ username: 'auditor', password: 'Auditor123*' });
    });
});
