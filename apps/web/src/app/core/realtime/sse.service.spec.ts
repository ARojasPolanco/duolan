import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { SseService } from './sse.service';

describe('SseService', () => {
  let service: SseService;
  let token: string | null;
  let pollCount = 0;
  const onPoll = (): void => {
    pollCount += 1;
  };

  beforeEach(() => {
    token = null;
    pollCount = 0;

    TestBed.configureTestingModule({
      providers: [
        SseService,
        { provide: AuthService, useValue: { getToken: () => token } },
        { provide: ApiService, useValue: { post: vi.fn() } },
      ],
    });

    service = TestBed.inject(SseService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it('queda idle sin token', () => {
    service.start(onPoll);

    expect(service.status()).toBe('idle');
    expect(pollCount).toBe(0);
  });

  it('usa polling cuando EventSource no está disponible', () => {
    vi.useFakeTimers();
    token = 'jwt-token';

    service.start(onPoll);

    expect(service.status()).toBe('polling');
    expect(pollCount).toBe(1);

    vi.advanceTimersByTime(20_000);
    expect(pollCount).toBe(2);

    service.stop();
    vi.advanceTimersByTime(20_000);
    expect(pollCount).toBe(2);
    expect(service.status()).toBe('idle');
  });
});
