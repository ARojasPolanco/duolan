import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../api/api-error';
import { AuthService } from '../auth/auth.service';
import { isAuthEndpoint, isPublicAuthRoute } from '../auth/auth-paths';
import { ToastService } from '../toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(request).pipe(
    catchError((error: unknown) => {
      const apiError = ApiError.from(error);

      if (apiError.status === 401 && !isAuthEndpoint(request.url)) {
        auth.logout();

        if (!isPublicAuthRoute(router.url)) {
          void router.navigate(['/login'], {
            queryParams: router.url && router.url !== '/' ? { redirect: router.url } : undefined,
          });
        }
      }

      if (apiError.status === 0 || apiError.status >= 500) {
        toast.error(apiError.message);
      }

      return throwError(() => apiError);
    }),
  );
};
