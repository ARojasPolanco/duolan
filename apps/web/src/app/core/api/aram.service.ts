import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ApiSuccess } from './models/common.model';
import type {
  ApplyToAramPostRequest,
  AramApplicationAcceptedResponse,
  AramApplicationResponse,
  AramMineResponse,
  AramPostResponse,
  AramQuery,
  AramResponse,
  CreateAramPostRequest,
} from './models/aram.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AramService {
  private readonly api = inject(ApiService);

  list(query: AramQuery = {}): Observable<AramResponse> {
    return this.api.get<AramResponse>('/aram', query);
  }

  create(payload: CreateAramPostRequest): Observable<AramPostResponse> {
    return this.api.post<AramPostResponse>('/aram', payload);
  }

  getMine(): Observable<AramMineResponse> {
    return this.api.get<AramMineResponse>('/aram/mine');
  }

  cancel(postId: string): Observable<ApiSuccess> {
    return this.api.delete<ApiSuccess>(`/aram/${postId}`);
  }

  apply(postId: string, payload: ApplyToAramPostRequest): Observable<AramApplicationResponse> {
    return this.api.post<AramApplicationResponse>(`/aram/${postId}/applications`, payload);
  }

  acceptApplication(
    postId: string,
    applicationId: string,
  ): Observable<AramApplicationAcceptedResponse> {
    return this.api.post<AramApplicationAcceptedResponse>(
      `/aram/${postId}/applications/${applicationId}/accept`,
    );
  }

  rejectApplication(postId: string, applicationId: string): Observable<AramApplicationResponse> {
    return this.api.post<AramApplicationResponse>(
      `/aram/${postId}/applications/${applicationId}/reject`,
    );
  }

  withdrawApplication(postId: string, applicationId: string): Observable<ApiSuccess> {
    return this.api.delete<ApiSuccess>(`/aram/${postId}/applications/${applicationId}`);
  }
}
