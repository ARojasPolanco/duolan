import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import type { ReportReason } from '../../../core/api/models/enums';
import { TrustService } from '../../../core/api/trust.service';
import { REPORT_REASON_LABEL_KEYS } from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { DialogComponent } from '../../../shared/ui/dialog.component';

const REASONS: ReportReason[] = [
  'toxicity',
  'fake_rank',
  'abandonment',
  'spam',
  'underage',
  'other',
];

@Component({
  selector: 'app-report-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, DialogComponent],
  template: `
    <app-dialog
      [open]="open()"
      [title]="i18n.t('report.title', { name: target().username })"
      (closed)="closed.emit()"
    >
      <p class="text-sm text-muted">{{ i18n.t('report.subtitle') }}</p>

      <form class="mt-4 grid gap-4" (ngSubmit)="submit()">
        <label class="grid gap-1.5 text-xs font-semibold text-muted">
          {{ i18n.t('report.reason') }}
          <select
            [value]="reason()"
            (change)="setReason($event)"
            class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            @for (option of reasons; track option) {
              <option [value]="option">{{ i18n.t(REPORT_REASON_LABEL_KEYS[option]) }}</option>
            }
          </select>
        </label>

        <label class="grid gap-1.5 text-xs font-semibold text-muted">
          {{ i18n.t('report.detail') }}
          {{ reason() === 'other' ? i18n.t('report.required') : i18n.t('report.optional') }}
          <textarea
            [value]="details()"
            (input)="setDetails($event)"
            maxlength="500"
            rows="3"
            [placeholder]="i18n.t('report.detailPlaceholder')"
            class="resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-muted/60"
          ></textarea>
        </label>

        <div class="flex flex-col gap-2 sm:flex-row">
          <app-button type="submit" variant="danger" [fullWidth]="true" [loading]="busy()">
            {{ busy() ? i18n.t('report.sending') : i18n.t('report.submit') }}
          </app-button>
          <app-button type="button" variant="secondary" (click)="closed.emit()">
            {{ i18n.t('report.cancel') }}
          </app-button>
        </div>
      </form>
    </app-dialog>
  `,
})
export class ReportDialogComponent {
  private readonly trust = inject(TrustService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);
  protected readonly REPORT_REASON_LABEL_KEYS = REPORT_REASON_LABEL_KEYS;

  readonly target = input.required<PublicProfile>();
  readonly open = input(false);
  readonly closed = output<void>();
  readonly reported = output<void>();

  protected readonly reasons = REASONS;
  protected readonly reason = signal<ReportReason>('toxicity');
  protected readonly details = signal('');
  protected readonly busy = signal(false);

  protected setReason(event: Event): void {
    this.reason.set((event.target as HTMLSelectElement).value as ReportReason);
  }

  protected setDetails(event: Event): void {
    this.details.set((event.target as HTMLTextAreaElement).value);
  }

  protected submit(): void {
    if (this.reason() === 'other' && !this.details().trim()) {
      this.toast.error(this.i18n.t('report.detailRequired'));
      return;
    }

    this.busy.set(true);

    this.trust
      .report({
        reportedUserId: this.target().id,
        reason: this.reason(),
        details: this.details().trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.toast.success(this.i18n.t('report.success', { name: this.target().username }));
          this.reported.emit();
          this.closed.emit();
        },
        error: () => {
          this.busy.set(false);
          this.toast.error(this.i18n.t('report.error'));
        },
      });
  }
}
