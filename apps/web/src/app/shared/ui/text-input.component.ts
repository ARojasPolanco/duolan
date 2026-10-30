import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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
      <input
        [id]="inputId()"
        [type]="type()"
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

  readonly inputId = input(`duolan-input-${TextInputComponent.nextId++}`);
  readonly label = input('');
  readonly type = input<'text' | 'email' | 'password' | 'search'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly hint = input('');
  readonly error = input('');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected inputClasses(): string {
    const base =
      'min-h-11 w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/70 transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';
    return `${base} ${this.error() ? 'border-danger/70' : 'border-border'}`;
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
}
