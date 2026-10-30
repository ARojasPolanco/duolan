import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ApiSuccess } from './models/common.model';
import type { InviteAcceptResponse, InviteBox, InvitesResponse } from './models/invite.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvitesService {
  private readonly api = inject(ApiService);

  list(box: InviteBox = 'incoming'): Observable<InvitesResponse> {
    return this.api.get<InvitesResponse>('/invites', { box });
  }

  accept(inviteId: string): Observable<InviteAcceptResponse> {
    return this.api.post<InviteAcceptResponse>(`/invites/${inviteId}/accept`);
  }

  decline(inviteId: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/invites/${inviteId}/decline`);
  }

  cancel(inviteId: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/invites/${inviteId}/cancel`);
  }
}
