import { Routes } from '@angular/router';

import { roleGuard } from '@core/auth/role.guard';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/invoice-list/invoice-list').then(m => m.InvoiceList)
  },
  {
    path: 'new',
    canActivate: [roleGuard('OPERADOR')],
    loadComponent: () =>
      import('./pages/invoice-create/invoice-create').then(m => m.InvoiceCreate)
  }
];
