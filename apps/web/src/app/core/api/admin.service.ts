import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ApiSuccess } from './models/common.model';
import type {
  AdminMetricsSummary,
  AdminOverviewResponse,
  AdminReportsQuery,
  AdminReportsResponse,
  AdminStreamStats,
  AdminUserDetailResponse,
  AdminUsersQuery,
  AdminUsersResponse,
  ResolveReportRequest,
  SuspendUserRequest,
  WarnUserRequest,
} from './models/admin.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  getOverview(): Observable<AdminOverviewResponse> {
    return this.api.get<AdminOverviewResponse>('/admin/overview');
  }

  getUsers(query: AdminUsersQuery = {}): Observable<AdminUsersResponse> {
    return this.api.get<AdminUsersResponse>('/admin/users', query);
  }

  getUserDetail(userId: string): Observable<AdminUserDetailResponse> {
    return this.api.get<AdminUserDetailResponse>(`/admin/users/${userId}`);
  }

  getReports(query: AdminReportsQuery = {}): Observable<AdminReportsResponse> {
    return this.api.get<AdminReportsResponse>('/admin/reports', query);
  }

  resolveReport(reportId: string, payload: ResolveReportRequest): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/admin/reports/${reportId}/resolve`, payload);
  }

  warnUser(userId: string, payload: WarnUserRequest): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/admin/users/${userId}/warn`, payload);
  }

  suspendUser(userId: string, payload: SuspendUserRequest): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/admin/users/${userId}/suspend`, payload);
  }

  requestUsernameChange(userId: string, note?: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/admin/users/${userId}/username-request`, { note });
  }

  approveUsernameChange(requestId: string, username?: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/admin/username-changes/${requestId}/approve`, {
      username,
    });
  }

  rejectUsernameChange(requestId: string, note?: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`/admin/username-changes/${requestId}/reject`, { note });
  }

  getMetricsSummary(from: string, to: string): Observable<AdminMetricsSummary> {
    return this.api.get<AdminMetricsSummary>('/admin/metrics/summary', { from, to });
  }

  getStreamStats(): Observable<AdminStreamStats> {
    return this.api.get<AdminStreamStats>('/events/stats');
  }
}
