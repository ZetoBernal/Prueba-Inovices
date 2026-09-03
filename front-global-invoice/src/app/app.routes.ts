import { Routes } from '@angular/router';

import { authGuard } from '@core/auth/auth.guard';
import { roleGuard } from '@core/auth/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () => import('@features/auth/login').then(m => m.Login)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@features/layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'invoices',
        loadChildren: () =>
          import('@features/invoices/invoices.routes').then(m => m.INVOICES_ROUTES)
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard('AUDITOR')],
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
