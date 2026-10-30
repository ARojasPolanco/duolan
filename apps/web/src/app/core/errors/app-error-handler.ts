import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '../toast/toast.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error('[DuoLAN] Error no controlado', error);
    this.toast.error('Ocurrió un error inesperado. Si el problema sigue, recargá la página.');
  }
}
