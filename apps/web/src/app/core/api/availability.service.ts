import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  AvailabilityListResponse,
  AvailabilityMineResponse,
  AvailabilityQuery,
  AvailabilitySession,
  CreateAvailabilityRequest,
  InviteFromAvailabilityRequest,
} from './models/availability.model';
import type { Invite } from './models/invite.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly api = inject(ApiService);

  create(payload: CreateAvailabilityRequest): Observable<AvailabilitySession> {
    return this.api.post<AvailabilitySession>('/availability', payload);
  }

  close(): Observable<AvailabilitySession> {
    return this.api.delete<AvailabilitySession>('/availability');
  }

  list(query: AvailabilityQuery = {}): Observable<AvailabilityListResponse> {
    return this.api.get<AvailabilityListResponse>('/availability', query);
  }

  getMine(): Observable<AvailabilityMineResponse> {
    return this.api.get<AvailabilityMineResponse>('/availability/me');
  }

  invite(
    availabilityId: string,
    payload: InviteFromAvailabilityRequest,
  ): Observable<{ status: 'success'; invite: Invite }> {
    return this.api.post<{ status: 'success'; invite: Invite }>(
      `/availability/${availabilityId}/invite`,
      payload,
    );
  }
}
