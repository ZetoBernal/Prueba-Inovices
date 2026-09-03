export type UserRole = 'OPERADOR' | 'AUDITOR';

export interface AuthUser {
    username: string;
    role: UserRole;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    role: UserRole;
    expiresAt: string;
}