import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/user.model';
import { AuthService } from './auth.service';

export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn => () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.role();

    if (role && allowedRoles.includes(role)) return true;

    return router.createUrlTree([role ? auth.homeRouteForRole(role) : '/login']);
};