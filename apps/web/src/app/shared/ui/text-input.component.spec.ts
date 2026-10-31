import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TextInputComponent] });
  });

  it('alterna la visibilidad de la contraseña', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar contraseña');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('password');
  });

  it('no muestra el botón para inputs que no son contraseña', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
