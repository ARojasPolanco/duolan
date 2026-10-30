import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ApiSuccess } from './models/common.model';
import type {
  MyProfileResponse,
  PublicProfileResponse,
  UpdateProfileRequest,
  UsernameChangeResponse,
} from './models/profile.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly api = inject(ApiService);

  getMine(): Observable<MyProfileResponse> {
    return this.api.get<MyProfileResponse>('/profiles/me');
  }

  updateMine(payload: UpdateProfileRequest): Observable<MyProfileResponse> {
    return this.api.patch<MyProfileResponse>('/profiles/me', payload);
  }

  getPublic(profileId: string): Observable<PublicProfileResponse> {
    return this.api.get<PublicProfileResponse>(`/profiles/${profileId}`);
  }

  getUsernameChange(): Observable<UsernameChangeResponse> {
    return this.api.get<UsernameChangeResponse>('/username-changes/mine');
  }

  suggestUsername(requestId: string, username: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/username-changes/${requestId}/suggest`, { username });
  }
}
