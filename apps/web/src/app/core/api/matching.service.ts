import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  CandidateQuery,
  CandidatesResponse,
  LikeResponse,
  MatchReminderResponse,
  MatchResponse,
  MatchesResponse,
  OutgoingLikesResponse,
} from './models/matching.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  private readonly api = inject(ApiService);

  getReminder(): Observable<MatchReminderResponse> {
    return this.api.get<MatchReminderResponse>('/matching/reminder');
  }

  getCandidates(query: CandidateQuery = {}): Observable<CandidatesResponse> {
    return this.api.get<CandidatesResponse>('/matching/candidates', query);
  }

  like(targetUserId: string): Observable<LikeResponse> {
    return this.api.post<LikeResponse>('/matching/likes', { targetUserId });
  }

  unlike(targetUserId: string): Observable<LikeResponse> {
    return this.api.delete<LikeResponse>(`/matching/likes/${targetUserId}`);
  }

  getOutgoingLikes(): Observable<OutgoingLikesResponse> {
    return this.api.get<OutgoingLikesResponse>('/matching/likes');
  }

  getMatches(): Observable<MatchesResponse> {
    return this.api.get<MatchesResponse>('/matching/matches');
  }

  getMatch(connectionId: string): Observable<MatchResponse> {
    return this.api.get<MatchResponse>(`/matching/matches/${connectionId}`);
  }

  archiveMatch(connectionId: string): Observable<MatchResponse> {
    return this.api.post<MatchResponse>(`/matching/matches/${connectionId}/archive`);
  }
}
