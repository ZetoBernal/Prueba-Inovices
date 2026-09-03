import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse, UserRole } from '../models/user.model';
import { isTokenExpired } from './jwt.utils';

const TOKEN_KEY = 'gi_token';
const USER_KEY = 'gi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly _user = signal<AuthUser | null>(this.restoreSession());

    readonly user = this._user.asReadonly();
    readonly isAuthenticated = computed(() => this._user() !== null);
    readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http
        .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
        .pipe(tap(response => this.persistSession(response)));
    }

    logout(redirect = true): void {
        this.clearStorage();
        this._user.set(null);
        if (redirect) this.router.navigate(['/login']);
    }

    get token(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    homeRouteForRole(role: UserRole): string {
        return role === 'AUDITOR' ? '/dashboard' : '/invoices';
    }

    private persistSession(response: LoginResponse): void {
        const user: AuthUser = { username: response.username, role: response.role };

        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._user.set(user);
    }

    private restoreSession(): AuthUser | null {
        const token = localStorage.getItem(TOKEN_KEY);
        const rawUser = localStorage.getItem(USER_KEY);

        if (!token || !rawUser || isTokenExpired(token)) {
            this.clearStorage();
            return null;
        }

        try {
            return JSON.parse(rawUser) as AuthUser;
        } catch {
            this.clearStorage();
            return null;
        }
    }

    private clearStorage(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
}