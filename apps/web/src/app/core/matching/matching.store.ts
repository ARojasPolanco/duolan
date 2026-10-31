import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchingService } from '../api/matching.service';
import { AuthService } from '../auth/auth.service';

const REFRESH_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class MatchingStore {
  private readonly api = inject(MatchingService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _candidateCount = signal(0);
  readonly candidateCount = this._candidateCount.asReadonly();

  private timer: ReturnType<typeof setInterval> | null = null;
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.refresh();
    this.timer = setInterval(() => {
      if (document.visibilityState === 'visible') this.refresh();
    }, REFRESH_MS);
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  stop(): void {
    this.started = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this._candidateCount.set(0);
  }

  refresh(): void {
    if (!this.canFetch()) {
      this._candidateCount.set(0);
      return;
    }

    this.api
      .getCandidates({ limit: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this._candidateCount.set(Number(response.total || 0)),
        error: () => this._candidateCount.set(0),
      });
  }

  private readonly handleVisibility = (): void => {
    if (document.visibilityState === 'visible') this.refresh();
  };

  private canFetch(): boolean {
    const user = this.auth.user();
    return Boolean(
      this.auth.getToken() && user?.emailVerified && user.profileCompleted && user.role !== 'admin',
    );
  }
}
