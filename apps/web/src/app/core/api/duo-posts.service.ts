import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ApiSuccess } from './models/common.model';
import type {
  ApplicationAcceptedResponse,
  ApplyToDuoPostRequest,
  CreateDuoPostRequest,
  DuoApplicationResponse,
  DuoApplicationsResponse,
  DuoPostQuery,
  DuoPostResponse,
  DuoPostsResponse,
} from './models/duo-post.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DuoPostsService {
  private readonly api = inject(ApiService);

  create(payload: CreateDuoPostRequest): Observable<DuoPostResponse> {
    return this.api.post<DuoPostResponse>('/duo-posts', payload);
  }

  list(query: DuoPostQuery = {}): Observable<DuoPostsResponse> {
    return this.api.get<DuoPostsResponse>('/duo-posts', query);
  }

  getMine(): Observable<DuoPostsResponse> {
    return this.api.get<DuoPostsResponse>('/duo-posts/mine');
  }

  get(postId: string): Observable<DuoPostResponse> {
    return this.api.get<DuoPostResponse>(`/duo-posts/${postId}`);
  }

  cancel(postId: string): Observable<ApiSuccess> {
    return this.api.delete<ApiSuccess>(`/duo-posts/${postId}`);
  }

  apply(postId: string, payload: ApplyToDuoPostRequest): Observable<DuoApplicationResponse> {
    return this.api.post<DuoApplicationResponse>(`/duo-posts/${postId}/apply`, payload);
  }

  getApplications(postId: string): Observable<DuoApplicationsResponse> {
    return this.api.get<DuoApplicationsResponse>(`/duo-posts/${postId}/applications`);
  }

  acceptApplication(
    postId: string,
    applicationId: string,
  ): Observable<ApplicationAcceptedResponse> {
    return this.api.post<ApplicationAcceptedResponse>(
      `/duo-posts/${postId}/applications/${applicationId}/accept`,
    );
  }

  rejectApplication(postId: string, applicationId: string): Observable<DuoApplicationResponse> {
    return this.api.post<DuoApplicationResponse>(
      `/duo-posts/${postId}/applications/${applicationId}/reject`,
    );
  }

  withdrawApplication(postId: string, applicationId: string): Observable<ApiSuccess> {
    return this.api.delete<ApiSuccess>(`/duo-posts/${postId}/applications/${applicationId}`);
  }
}
