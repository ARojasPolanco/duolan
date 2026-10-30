import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  BlockResponse,
  BlockedUser,
  BlocksResponse,
  ConnectionFeedbackResponse,
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  CreateReportRequest,
  CreateReportResponse,
  PendingFeedbackResponse,
} from './models/trust.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TrustService {
  private readonly api = inject(ApiService);

  report(payload: CreateReportRequest): Observable<CreateReportResponse> {
    return this.api.post<CreateReportResponse>('/reports', payload);
  }

  getBlocks(): Observable<BlocksResponse> {
    return this.api.get<BlocksResponse>('/blocks');
  }

  block(userId: string): Observable<BlockResponse> {
    return this.api.post<BlockResponse>('/blocks', { userId });
  }

  unblock(userId: string): Observable<BlockedUser> {
    return this.api.delete<BlockedUser>(`/blocks/${userId}`);
  }

  submitFeedback(payload: CreateFeedbackRequest): Observable<CreateFeedbackResponse> {
    return this.api.post<CreateFeedbackResponse>('/feedback', payload);
  }

  getPendingFeedback(): Observable<PendingFeedbackResponse> {
    return this.api.get<PendingFeedbackResponse>('/feedback/pending');
  }

  getConnectionFeedback(connectionId: string): Observable<ConnectionFeedbackResponse> {
    return this.api.get<ConnectionFeedbackResponse>(`/feedback/connection/${connectionId}`);
  }
}
