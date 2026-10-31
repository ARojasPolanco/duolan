import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  AvailabilityCloseResponse,
  AvailabilityListResponse,
  AvailabilityMineResponse,
  AvailabilityQuery,
  AvailabilitySessionResponse,
  CreateAvailabilityRequest,
  InviteFromAvailabilityRequest,
} from './models/availability.model';
import type { Invite } from './models/invite.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly api = inject(ApiService);

  create(payload: CreateAvailabilityRequest): Observable<AvailabilitySessionResponse> {
    return this.api.post<AvailabilitySessionResponse>('/availability', payload);
  }

  close(): Observable<AvailabilityCloseResponse> {
    return this.api.delete<AvailabilityCloseResponse>('/availability');
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
