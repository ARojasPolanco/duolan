import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, type ButtonVariant } from './button.component';
import { DialogComponent } from './dialog.component';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, DialogComponent],
  template: `
    <app-dialog [open]="open()" [title]="title()" (closed)="closed.emit()">
      <p class="text-sm leading-relaxed text-muted">{{ message() }}</p>
      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <app-button type="button" variant="secondary" [disabled]="busy()" (click)="closed.emit()">
          {{ cancelLabel() }}
        </app-button>
        <app-button
          type="button"
          [variant]="variant()"
          [loading]="busy()"
          (click)="confirmed.emit()"
        >
          {{ confirmLabel() }}
        </app-button>
      </div>
    </app-dialog>
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly message = input('');
  readonly confirmLabel = input('');
  readonly cancelLabel = input('');
  readonly variant = input<ButtonVariant>('danger');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly closed = output<void>();
}
