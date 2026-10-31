import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match } from '../../../core/api/models/matching.model';
import type {
  ConnectionFeedbackResponse,
  CreateFeedbackResponse,
} from '../../../core/api/models/trust.model';
import { TrustService } from '../../../core/api/trust.service';
import { FeedbackPanelComponent } from './feedback-panel.component';

const match = {
  id: 'connection-1',
  other: { username: 'demo_adc' },
  feedback: { mine: 'pending', theirs: 'pending', revealed: false },
} as unknown as Match;

const detail: ConnectionFeedbackResponse = {
  status: 'success',
  revealed: false,
  windowOpen: true,
  expiresAt: '2026-11-07T00:00:00.000Z',
  mine: null,
  theirs: null,
};

const createResponse: CreateFeedbackResponse = {
  status: 'success',
  revealed: false,
  feedback: {
    id: 'feedback-1',
    connectionId: 'connection-1',
    sentiment: 'positive',
    tags: [],
    comment: null,
    createdAt: '2026-10-31T00:00:00.000Z',
  },
};

describe('FeedbackPanelComponent', () => {
  let getConnectionFeedback: ReturnType<typeof vi.fn>;
  let submitFeedback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getConnectionFeedback = vi.fn(() => of(detail));
    submitFeedback = vi.fn(() => of(createResponse));

    TestBed.configureTestingModule({
      imports: [FeedbackPanelComponent],
      providers: [{ provide: TrustService, useValue: { getConnectionFeedback, submitFeedback } }],
    });
  });

  it('carga el detalle después de que Angular asigna el match', () => {
    const fixture = TestBed.createComponent(FeedbackPanelComponent);
    fixture.componentRef.setInput('match', match);
    fixture.detectChanges();

    expect(getConnectionFeedback).toHaveBeenCalledWith('connection-1');
    expect(fixture.nativeElement.textContent).toContain('Feedback del duo');
  });

  it('envía el feedback sin recargar la página', () => {
    const fixture = TestBed.createComponent(FeedbackPanelComponent);
    fixture.componentRef.setInput('match', match);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(submitFeedback).toHaveBeenCalledWith({
      connectionId: 'connection-1',
      sentiment: 'positive',
      tags: [],
      comment: undefined,
    });
  });
});
