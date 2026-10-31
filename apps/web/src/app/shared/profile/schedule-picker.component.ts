import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { BLOCK_LABEL_KEYS, DAY_LABEL_KEYS } from '../../core/i18n/labels';
import type {
  Country,
  ScheduleBlock,
  ScheduleDay,
  ScheduleSlot,
} from '../../core/api/models/enums';
import {
  BLOCK_HOURS,
  PROFILE_BLOCKS,
  PROFILE_DAYS,
  WEEKDAY_NIGHTS,
  WEEKEND_BLOCKS,
} from '../../core/profile/profile-options';
import { formatBlockRange } from '../../core/utils/time';

@Component({
  selector: 'app-schedule-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-border bg-bg p-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold">{{ i18n.t('onboarding.shortcuts') }}</p>
          <p class="text-xs text-muted">{{ i18n.t('onboarding.shortcutsHint') }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            (click)="merge(WEEKDAY_NIGHTS)"
            class="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs font-semibold text-muted transition hover:border-accent/50 hover:text-text"
          >
            {{ i18n.t('onboarding.weeknights') }}
          </button>
          <button
            type="button"
            (click)="merge(WEEKEND_BLOCKS)"
            class="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs font-semibold text-muted transition hover:border-accent/50 hover:text-text"
          >
            {{ i18n.t('onboarding.weekend') }}
          </button>
          @if (value().length) {
            <button
              type="button"
              (click)="clear()"
              class="inline-flex min-h-11 items-center rounded-full px-2 text-xs font-semibold text-danger"
            >
              {{ i18n.t('onboarding.clear') }}
            </button>
          }
        </div>
      </div>

      <p class="mt-3 text-xs text-muted">
        @if (value().length === 0) {
          {{ i18n.t('onboarding.noBlocks') }}
        } @else if (value().length === 1) {
          {{ i18n.t('onboarding.selectedBlock', { count: 1 }) }}
        } @else {
          {{ i18n.t('onboarding.selectedBlocks', { count: value().length }) }}
        }
      </p>
    </div>

    <div class="mt-4 space-y-2">
      @for (day of days; track day) {
        <div class="rounded-2xl border border-border bg-bg p-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-bold">{{ i18n.t(dayKey(day)) }}</p>
            <span
              class="text-[11px] font-semibold"
              [class.text-accent]="countForDay(day) > 0"
              [class.text-muted]="countForDay(day) === 0"
            >
              {{ countForDay(day) ? countForDay(day) : i18n.t('onboarding.noSchedule') }}
            </span>
          </div>

          <div class="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            @for (slot of slots; track slot) {
              <button
                type="button"
                (click)="toggle(day, slot)"
                [attr.aria-pressed]="isSelected(day, slot)"
                [attr.aria-label]="
                  i18n.t(dayKey(day)) + ', ' + i18n.t(slotKey(slot)) + ' (' + slotHours(slot) + ')'
                "
                class="flex min-h-11 flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-[11px] font-semibold transition"
                [class.border-accent]="isSelected(day, slot)"
                [class.bg-accent]="isSelected(day, slot)"
                [class.text-bg]="isSelected(day, slot)"
                [class.border-border]="!isSelected(day, slot)"
                [class.text-muted]="!isSelected(day, slot)"
              >
                <span>{{ i18n.t(slotKey(slot)) }}</span>
                <span class="text-[10px] font-medium opacity-75">{{ slotHours(slot) }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SchedulePickerComponent {
  protected readonly i18n = inject(I18nService);

  readonly value = input<ScheduleBlock[]>([]);
  readonly country = input<Country | null>(null);
  readonly valueChange = output<ScheduleBlock[]>();

  protected readonly days = PROFILE_DAYS;
  protected readonly slots = PROFILE_BLOCKS;
  protected readonly hours = BLOCK_HOURS;
  protected readonly WEEKDAY_NIGHTS = WEEKDAY_NIGHTS;
  protected readonly WEEKEND_BLOCKS = WEEKEND_BLOCKS;

  private readonly selected = computed(() => new Set(this.value()));

  protected dayKey(day: ScheduleDay) {
    return DAY_LABEL_KEYS[day];
  }

  protected slotKey(slot: ScheduleSlot) {
    return BLOCK_LABEL_KEYS[slot];
  }

  protected slotHours(slot: ScheduleSlot): string {
    return this.country() ? formatBlockRange(slot, this.country()) : this.hours[slot];
  }

  protected isSelected(day: ScheduleDay, slot: ScheduleSlot): boolean {
    return this.selected().has(`${day}_${slot}` as ScheduleBlock);
  }

  protected countForDay(day: ScheduleDay): number {
    return this.slots.filter((slot) => this.isSelected(day, slot)).length;
  }

  protected toggle(day: ScheduleDay, slot: ScheduleSlot): void {
    const block = `${day}_${slot}` as ScheduleBlock;
    const next = new Set(this.value());
    if (next.has(block)) next.delete(block);
    else next.add(block);
    this.valueChange.emit([...next]);
  }

  protected merge(blocks: ScheduleBlock[]): void {
    this.valueChange.emit([...new Set([...this.value(), ...blocks])]);
  }

  protected clear(): void {
    this.valueChange.emit([]);
  }
}
