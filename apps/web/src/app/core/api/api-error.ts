import { HttpErrorResponse } from '@angular/common/http';
import type { ApiErrorPayload } from './models/common.model';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof HttpErrorResponse) {
      const payload = error.error as ApiErrorPayload | null;
      const message =
        typeof payload?.message === 'string' && payload.message.trim()
          ? payload.message
          : defaultMessageForStatus(error.status);
      return new ApiError(message, error.status);
    }

    if (error instanceof Error && error.message) {
      return new ApiError(error.message, 0);
    }

    return new ApiError('Ocurrió un error inesperado. Intentá de nuevo.', 0);
  }
}

export const defaultMessageForStatus = (status: number): string => {
  switch (status) {
    case 0:
      return 'No pudimos conectar con el servidor. Revisá tu conexión.';
    case 400:
      return 'La solicitud no es válida.';
    case 401:
      return 'Tu sesión venció. Iniciá sesión de nuevo.';
    case 403:
      return 'No tenés permisos para hacer eso.';
    case 404:
      return 'No encontramos lo que buscabas.';
    case 409:
      return 'Esa acción ya se realizó o entra en conflicto con el estado actual.';
    case 422:
      return 'Revisá los datos ingresados.';
    case 429:
      return 'Hiciste demasiadas solicitudes. Esperá unos minutos.';
    default:
      return status >= 500
        ? 'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
        : 'Ocurrió un error inesperado. Intentá de nuevo.';
  }
};

export const toUserMessage = (error: unknown): string => ApiError.from(error).message;
