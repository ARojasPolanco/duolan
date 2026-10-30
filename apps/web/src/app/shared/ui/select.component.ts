import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="grid gap-1.5">
      @if (label()) {
        <label [for]="selectId()" class="text-xs font-semibold text-muted">{{ label() }}</label>
      }
      <select
        [id]="selectId()"
        [value]="value()"
        [disabled]="disabled()"
        (change)="handleChange($event)"
        (blur)="handleBlur()"
        class="min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        @if (placeholder()) {
          <option value="" disabled>{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      @if (error()) {
        <p class="text-xs text-danger">{{ error() }}</p>
      } @else if (hint()) {
        <p class="text-xs text-muted">{{ hint() }}</p>
      }
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  private static nextId = 0;

  readonly selectId = input(`duolan-select-${SelectComponent.nextId++}`);
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly options = input<SelectOption[]>([]);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
