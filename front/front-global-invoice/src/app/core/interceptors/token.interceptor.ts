import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(AuthService).token;

    const isOwnApi = req.url.startsWith(environment.apiUrl);

    if (!token || !isOwnApi) return next(req);

    return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    }));
};