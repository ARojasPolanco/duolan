import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="grid gap-1.5">
      @if (label()) {
        <label [for]="inputId()" class="text-xs font-semibold text-muted">{{ label() }}</label>
      }
      <div class="relative">
        <input
          [id]="inputId()"
          [type]="actualType()"
          [value]="value()"
          [placeholder]="placeholder()"
          [autocomplete]="autocomplete()"
          [disabled]="disabled()"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
          [class]="inputClasses()"
          [attr.aria-invalid]="error() ? 'true' : null"
          [attr.aria-describedby]="hint() || error() ? inputId() + '-help' : null"
        />
        @if (isPassword()) {
          <button
            type="button"
            (click)="togglePasswordVisibility()"
            [attr.aria-label]="passwordToggleLabel()"
            [attr.aria-pressed]="passwordVisible()"
            [attr.aria-controls]="inputId()"
            class="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-muted transition hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            @if (passwordVisible()) {
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path
                  d="M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 8.5 4.4 9.5 7a12.1 12.1 0 0 1-3 4.1M6.3 6.3A12.6 12.6 0 0 0 2.5 12c1 2.6 4.5 7 9.5 7 1.4 0 2.7-.3 3.8-.8"
                />
              </svg>
            } @else {
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path
                  d="M2.5 12C3.5 9.4 7 5 12 5s8.5 4.4 9.5 7c-1 2.6-4.5 7-9.5 7s-8.5-4.4-9.5-7Z"
                />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            }
          </button>
        }
      </div>
      @if (error()) {
        <p [id]="inputId() + '-help'" class="text-xs text-danger">{{ error() }}</p>
      } @else if (hint()) {
        <p [id]="inputId() + '-help'" class="text-xs text-muted">{{ hint() }}</p>
      }
    </div>
  `,
})
export class TextInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  private readonly i18n = inject(I18nService);

  readonly inputId = input(`duolan-input-${TextInputComponent.nextId++}`);
  readonly label = input('');
  readonly type = input<'text' | 'email' | 'password' | 'search'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly hint = input('');
  readonly error = input('');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly actualType = computed(() =>
    this.type() === 'password' && this.passwordVisible() ? 'text' : this.type(),
  );
  protected readonly passwordToggleLabel = computed(() =>
    this.i18n.t(this.passwordVisible() ? 'common.hidePassword' : 'common.showPassword'),
  );

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected inputClasses(): string {
    const base =
      'min-h-11 w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/70 transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';
    const padding = this.isPassword() ? 'pr-11' : '';
    return `${base} ${padding} ${this.error() ? 'border-danger/70' : 'border-border'}`;
  }

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

  protected handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }
}
