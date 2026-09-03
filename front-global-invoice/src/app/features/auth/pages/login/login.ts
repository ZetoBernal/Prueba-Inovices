import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Login {
    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly hidePassword = signal(true);

    readonly form = this.fb.nonNullable.group({
        username: ['', [Validators.required, Validators.maxLength(50)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    submit(): void {
        if (this.form.invalid || this.loading()) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);
        this.form.disable();

        this.auth.login(this.form.getRawValue()).subscribe({
        next: response => {
            this.router.navigateByUrl(
            this.safeReturnUrl() ?? this.auth.homeRouteForRole(response.role)
            );
        },
        error: (error: HttpErrorResponse) => {
            this.loading.set(false);
            this.form.enable();
            this.errorMessage.set(this.messageFor(error));
        }
        });
    }

    fillCredentials(username: string, password: string): void {
        this.form.setValue({ username, password });
    }
    
    private safeReturnUrl(): string | null {
        const url = this.route.snapshot.queryParamMap.get('returnUrl');

        if (!url || !url.startsWith('/') || url.startsWith('//')) return null;

        return url;
    }

    private messageFor(error: HttpErrorResponse): string {
        switch (error.status) {
            case 0:   return 'No se pudo conectar con el servidor.';
            case 429: return 'Demasiados intentos. Espera un minuto e intenta de nuevo.';
            default:  return 'Usuario o contraseña incorrectos.';
        }
    }
}