import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: 'login',
        loadComponent: () =>
        import('./features/auth/pages/login/login').then(m => m.Login)
    },
    { path: '**', redirectTo: 'login' }
];