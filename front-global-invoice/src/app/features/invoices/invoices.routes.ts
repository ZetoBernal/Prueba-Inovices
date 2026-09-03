import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
        import('./pages/invoice-list/invoice-list').then(m => m.InvoiceList)
    }
];