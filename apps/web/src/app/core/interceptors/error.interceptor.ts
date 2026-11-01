// Equivalente a un interceptor de axios en React: normaliza errores,
// maneja 401/403 y evita redirects en los endpoints de autenticación.
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../api/api-error';
import { AuthService } from '../auth/auth.service';
import { isAuthEndpoint, isPublicAuthRoute } from '../auth/auth-paths';
import { I18nService } from '../i18n/i18n.service';
import { ToastService } from '../toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const i18n = inject(I18nService);

  return next(request).pipe(
    catchError((error: unknown) => {
      const apiError = ApiError.from(error);
      const suspended =
        apiError.status === 403 && apiError.message.toLowerCase().includes('suspendida');

      if (suspended && !isPublicAuthRoute(router.url)) {
        sessionStorage.setItem('duolan_flash', apiError.message || i18n.t('auth.suspendedFlash'));
        auth.logout();
        void router.navigate(['/login']);
      }

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
