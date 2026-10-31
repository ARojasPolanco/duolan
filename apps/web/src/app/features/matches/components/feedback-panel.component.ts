import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FeedbackTag, Sentiment } from '../../../core/api/models/enums';
import type { ConnectionFeedbackResponse } from '../../../core/api/models/trust.model';
import type { Match } from '../../../core/api/models/matching.model';
import { TrustService } from '../../../core/api/trust.service';
import { FEEDBACK_TAG_LABEL_KEYS } from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { formatDateTime } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

const POSITIVE_TAGS: FeedbackTag[] = [
  'good_vibes',
  'communicative',
  'tryhard',
  'punctual',
  'good_game',
];
const NEGATIVE_TAGS: FeedbackTag[] = [
  'toxicity',
  'abandonment',
  'fake_rank',
  'no_communication',
  'other',
];

@Component({
  selector: 'app-feedback-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, SkeletonComponent],
  template: `
    <section class="mt-4 rounded-xl border border-border bg-bg p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-bold">{{ i18n.t('feedback.title') }}</h3>
          <p class="text-[11px] text-muted">{{ i18n.t('feedback.subtitle') }}</p>
        </div>
        <button
          type="button"
          (click)="closed.emit()"
          class="rounded-lg border border-border px-2 py-1 text-muted"
          [attr.aria-label]="i18n.t('common.close')"
        >
          ×
        </button>
      </div>

      @if (loading()) {
        <app-skeleton variant="card" class="mt-4 block" />
      } @else if (error()) {
        <p class="mt-4 text-sm text-danger">{{ error() }}</p>
      } @else if (detail(); as detail) {
        @if (detail.mine) {
          <div class="mt-4 rounded-xl border border-border bg-surface p-4">
            <p class="text-xs font-semibold text-muted">{{ i18n.t('feedback.yourFeedback') }}</p>
            <p class="mt-1 text-sm font-semibold">
              {{
                detail.mine.sentiment === 'positive'
                  ? i18n.t('feedback.positive')
                  : i18n.t('feedback.negative')
              }}
            </p>
            @if (detail.mine.tags.length) {
              <div class="mt-2 flex flex-wrap gap-1.5">
                @for (tag of detail.mine.tags; track tag) {
                  <span class="rounded-full border border-border px-2 py-1 text-[10px] text-muted">
                    {{ i18n.t(FEEDBACK_TAG_LABEL_KEYS[tag]) }}
                  </span>
                }
              </div>
            }
            @if (detail.mine.comment) {
              <p class="mt-2 text-sm text-muted">{{ detail.mine.comment }}</p>
            }
            <p class="mt-2 text-[10px] text-muted">
              {{ i18n.t('feedback.submittedOn', { date: formatDate(detail.mine.createdAt) }) }}
            </p>
          </div>
        }

        @if (detail.revealed && detail.theirs) {
          <div class="mt-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
            <p class="text-xs font-semibold text-accent">
              {{ i18n.t('feedback.theirFeedback', { name: match().other.username }) }}
            </p>
            <p class="mt-1 text-sm font-semibold">
              {{
                detail.theirs.sentiment === 'positive'
                  ? i18n.t('feedback.positive')
                  : i18n.t('feedback.negative')
              }}
            </p>
            @if (detail.theirs.tags.length) {
              <div class="mt-2 flex flex-wrap gap-1.5">
                @for (tag of detail.theirs.tags; track tag) {
                  <span class="rounded-full border border-border px-2 py-1 text-[10px] text-muted">
                    {{ i18n.t(FEEDBACK_TAG_LABEL_KEYS[tag]) }}
                  </span>
                }
              </div>
            }
            @if (detail.theirs.comment) {
              <p class="mt-2 text-sm text-muted">{{ detail.theirs.comment }}</p>
            }
          </div>
        }

        @if (detail.mine && !detail.revealed) {
          <p class="mt-3 text-[11px] text-muted">
            {{
              match().feedback.theirs === 'submitted'
                ? i18n.t('feedback.theirsSubmitted')
                : i18n.t('feedback.notRevealed')
            }}
          </p>
        }

        @if (!detail.mine && !detail.windowOpen) {
          <p class="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            {{ i18n.t('feedback.windowClosed') }}
          </p>
        }

        @if (!detail.mine && detail.windowOpen) {
          <form class="mt-4 space-y-3" (submit)="submit($event)">
            <div class="flex gap-2">
              <button
                type="button"
                (click)="changeSentiment('positive')"
                [class]="sentimentButtonClass('positive')"
              >
                {{ i18n.t('feedback.positive') }}
              </button>
              <button
                type="button"
                (click)="changeSentiment('negative')"
                [class]="sentimentButtonClass('negative')"
              >
                {{ i18n.t('feedback.negative') }}
              </button>
            </div>

            <div>
              <p class="text-[11px] font-semibold text-muted">
                {{ i18n.t('feedback.tagsLabel') }}
                {{
                  sentiment() === 'negative'
                    ? i18n.t('feedback.tagsNegativeHint')
                    : i18n.t('feedback.tagsPositiveHint')
                }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                @for (tag of tagOptions(); track tag) {
                  <button
                    type="button"
                    (click)="toggleTag(tag)"
                    class="rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition"
                    [class.border-accent]="tags().includes(tag)"
                    [class.bg-accent/15]="tags().includes(tag)"
                    [class.text-accent]="tags().includes(tag)"
                    [class.border-border]="!tags().includes(tag)"
                    [class.text-muted]="!tags().includes(tag)"
                  >
                    {{ i18n.t(FEEDBACK_TAG_LABEL_KEYS[tag]) }}
                  </button>
                }
              </div>
            </div>

            <textarea
              [value]="comment()"
              (input)="setComment($event)"
              maxlength="280"
              rows="2"
              [placeholder]="i18n.t('feedback.comment')"
              class="w-full resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-muted/60"
            ></textarea>

            <p class="text-[10px] text-muted">
              {{ i18n.t('feedback.windowUntil', { date: formatDate(detail.expiresAt) }) }}
            </p>

            <app-button type="submit" size="sm" [loading]="busy()">
              {{ busy() ? i18n.t('feedback.sending') : i18n.t('feedback.submit') }}
            </app-button>
          </form>
        }
      }
    </section>
  `,
})
export class FeedbackPanelComponent implements OnInit {
  private readonly trust = inject(TrustService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);
  protected readonly FEEDBACK_TAG_LABEL_KEYS = FEEDBACK_TAG_LABEL_KEYS;

  readonly match = input.required<Match>();
  readonly closed = output<void>();
  readonly submitted = output<void>();

  protected readonly detail = signal<ConnectionFeedbackResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected readonly sentiment = signal<Sentiment>('positive');
  protected readonly tags = signal<FeedbackTag[]>([]);
  protected readonly comment = signal('');
  protected readonly tagOptions = () =>
    this.sentiment() === 'positive' ? POSITIVE_TAGS : NEGATIVE_TAGS;
  protected readonly formatDate = (value: string) => formatDateTime(value, this.i18n.locale());

  ngOnInit(): void {
    this.load();
  }

  protected changeSentiment(sentiment: Sentiment): void {
    this.sentiment.set(sentiment);
    this.tags.set([]);
  }

  protected sentimentButtonClass(sentiment: Sentiment): string {
    const selected = this.sentiment() === sentiment;
    const active =
      sentiment === 'positive'
        ? 'border-success bg-success/10 text-success'
        : 'border-danger bg-danger/10 text-danger';
    return `flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
      selected ? active : 'border-border text-muted'
    }`;
  }

  protected setComment(event: Event): void {
    this.comment.set((event.target as HTMLTextAreaElement).value);
  }

  protected toggleTag(tag: FeedbackTag): void {
    const current = this.tags();
    if (current.includes(tag)) {
      this.tags.set(current.filter((item) => item !== tag));
      return;
    }
    if (current.length >= 3) return;
    this.tags.set([...current, tag]);
  }

  protected submit(event: Event): void {
    event.preventDefault();

    if (this.sentiment() === 'negative' && !this.tags().length) {
      this.toast.error(this.i18n.t('feedback.chooseTag'));
      return;
    }

    this.busy.set(true);

    this.trust
      .submitFeedback({
        connectionId: this.match().id,
        sentiment: this.sentiment(),
        tags: this.tags(),
        comment: this.comment().trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.busy.set(false);
          this.toast.success(
            response.revealed
              ? this.i18n.t('feedback.sentRevealed')
              : this.i18n.t('feedback.sentPending'),
          );
          this.load();
          this.submitted.emit();
        },
        error: () => {
          this.busy.set(false);
          this.toast.error(this.i18n.t('feedback.submitError'));
        },
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');

    this.trust
      .getConnectionFeedback(this.match().id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.detail.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(this.i18n.t('feedback.loadError'));
        },
      });
  }
}
