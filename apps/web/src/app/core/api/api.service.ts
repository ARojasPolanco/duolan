// Adaptación de un cliente HTTP de React (axios o wrapper de fetch) a Angular:
// una sola base URL, query params normalizados y respuestas tipadas.
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, query?: object): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.buildParams(query) });
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string, body?: unknown): Observable<T> {
    return this.http.delete<T>(this.url(path), body === undefined ? {} : { body });
  }

  private url(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalized}`;
  }

  private buildParams(query?: object): HttpParams {
    let params = new HttpParams();

    if (!query) return params;

    for (const [key, value] of Object.entries(query) as [string, unknown][]) {
      if (value === null || value === undefined || value === '') continue;
      params = params.set(key, String(value));
    }

    return params;
  }
}
