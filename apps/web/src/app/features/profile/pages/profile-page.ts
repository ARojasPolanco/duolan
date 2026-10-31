import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import type { Country, Language, RankTier } from '../../../core/api/models/enums';
import { ProfilesService } from '../../../core/api/profiles.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  COUNTRY_LABEL_KEYS,
  DIVISION_LABEL_KEYS,
  LANGUAGE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
  STYLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import {
  PROFILE_COUNTRIES,
  PROFILE_LANGUAGES,
  PROFILE_PLAY_STYLES,
  PROFILE_RANK_DIVISIONS,
  PROFILE_RANK_TIERS,
  PROFILE_ROLES,
  isApexTier,
} from '../../../core/profile/profile-options';
import {
  buildProfileForm,
  patchProfileForm,
  profilePayloadFromForm,
  profileStepError,
} from '../../../core/profile/profile-form';
import { ToastService } from '../../../core/toast/toast.service';
import { formatCountryOffset } from '../../../core/utils/time';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { RoleIconComponent } from '../../../shared/icons/role-icon.component';
import { SchedulePickerComponent } from '../../../shared/profile/schedule-picker.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { DialogComponent } from '../../../shared/ui/dialog.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SelectComponent, type SelectOption } from '../../../shared/ui/select.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RankIconComponent,
    RoleIconComponent,
    SchedulePickerComponent,
    ButtonComponent,
    CardComponent,
    DialogComponent,
    EmailVerificationBannerComponent,
    SelectComponent,
    TextInputComponent,
  ],
  template: `
    <div class="grid gap-5">
      <app-email-verification-banner />

      <app-card padding="lg">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {{ i18n.t('profile.eyebrow') }}
        </p>
        <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-extrabold sm:text-3xl">{{ i18n.t('profile.title') }}</h1>
            <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {{ i18n.t('profile.description') }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-bg px-4 py-3 text-xs text-muted">
            <span class="font-semibold text-text">&#64;{{ user()?.username }}</span>
            <br />
            {{ user()?.email }}
          </div>
        </div>
      </app-card>

      @if (loading()) {
        <div class="flex min-h-[40vh] items-center justify-center">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"
          ></div>
        </div>
      } @else {
        @if (errorKey()) {
          <p class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ i18n.t(errorKey()!) }}
          </p>
        }

        <form class="grid gap-5" [formGroup]="form" (ngSubmit)="save()" novalidate>
          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('profile.identity') }}</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <app-text-input
                formControlName="riotId"
                [label]="i18n.t('onboarding.riotIdLabel')"
                [placeholder]="i18n.t('onboarding.riotIdPlaceholder')"
                [hint]="i18n.t('profile.riotHint')"
                autocomplete="off"
              />
              <app-select
                formControlName="country"
                [label]="i18n.t('onboarding.countryLabel')"
                [placeholder]="i18n.t('onboarding.countryUnspecified')"
                [options]="countryOptions()"
              />
            </div>
            <p class="mt-3 text-xs text-muted">{{ i18n.t('profile.usernameNote') }}</p>
            <a
              routerLink="/solicitud-username"
              class="mt-3 inline-flex text-xs font-semibold text-accent hover:underline"
            >
              {{ i18n.t('username.title') }}
            </a>
          </app-card>

          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('profile.rolesRank') }}</h2>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.primaryRole') }}</p>
                <div class="grid grid-cols-3 gap-2">
                  @for (role of roles; track role) {
                    <button
                      type="button"
                      (click)="form.controls.primaryRole.setValue(role)"
                      [class]="roleButtonClass(form.controls.primaryRole.value === role)"
                    >
                      <app-role-icon [role]="role" [size]="20" />
                      <span>{{ i18n.t(ROLE_LABEL_KEYS[role]) }}</span>
                    </button>
                  }
                </div>
              </div>
              <div>
                <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.secondaryRole') }}</p>
                <div class="grid grid-cols-3 gap-2">
                  @for (role of roles; track role) {
                    <button
                      type="button"
                      (click)="form.controls.secondaryRole.setValue(role)"
                      [class]="roleButtonClass(form.controls.secondaryRole.value === role)"
                    >
                      <app-role-icon [role]="role" [size]="20" />
                      <span>{{ i18n.t(ROLE_LABEL_KEYS[role]) }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>

            @if (rolesConflict()) {
              <p class="mt-3 text-sm text-danger">{{ i18n.t('onboarding.distinctRoles') }}</p>
            }

            <div class="mt-5">
              <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.tier') }}</p>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
                @for (tier of rankTiers; track tier) {
                  <button
                    type="button"
                    (click)="setRankTier(tier)"
                    [attr.aria-pressed]="form.controls.rankTier.value === tier"
                    [class]="rankButtonClass(form.controls.rankTier.value === tier)"
                  >
                    <app-rank-icon [tier]="tier" [size]="34" />
                    <span class="text-center leading-tight">
                      {{ i18n.t(RANK_LABEL_KEYS[tier]) }}
                    </span>
                  </button>
                }
              </div>
            </div>

            @if (form.controls.rankTier.value && !isApex()) {
              <div class="mt-4">
                <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.division') }}</p>
                <div class="grid grid-cols-4 gap-2">
                  @for (division of divisions; track division) {
                    <button
                      type="button"
                      (click)="form.controls.rankDivision.setValue(division)"
                      [class]="choiceClass(form.controls.rankDivision.value === division)"
                    >
                      {{ i18n.t(DIVISION_LABEL_KEYS[division]) }}
                    </button>
                  }
                </div>
              </div>
            }

            <label class="mt-4 grid gap-1.5 text-xs font-semibold text-muted">
              {{ i18n.t('onboarding.lp') }}
              <input
                type="number"
                min="0"
                formControlName="rankLp"
                class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              />
            </label>

            <div class="mt-4 rounded-2xl border border-border bg-bg p-4">
              <p class="text-sm font-semibold">{{ i18n.t('onboarding.flexRank') }}</p>
              <p class="mt-1 text-xs leading-relaxed text-muted">
                {{ i18n.t('onboarding.flexRankBody') }}
              </p>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <app-select
                  formControlName="flexRankTier"
                  [label]="i18n.t('onboarding.flexTier')"
                  [placeholder]="i18n.t('onboarding.undeclared')"
                  [options]="tierOptions()"
                  (change)="onFlexTierChange()"
                />
                @if (form.controls.flexRankTier.value && !flexIsApex()) {
                  <app-select
                    formControlName="flexRankDivision"
                    [label]="i18n.t('onboarding.flexDivision')"
                    [placeholder]="i18n.t('onboarding.division')"
                    [options]="divisionOptions()"
                  />
                }
              </div>
              @if (form.controls.flexRankTier.value) {
                <label class="mt-3 grid gap-1.5 text-xs font-semibold text-muted">
                  {{ i18n.t('onboarding.flexLp') }}
                  <input
                    type="number"
                    min="0"
                    formControlName="flexRankLp"
                    class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                  />
                </label>
              }
            </div>
          </app-card>

          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('profile.schedule') }}</h2>
            <p class="mt-2 text-sm text-muted">{{ i18n.t('profile.scheduleBody') }}</p>
            @if (selectedCountry()) {
              <p class="mt-2 text-xs leading-relaxed text-muted">
                {{
                  i18n.t('onboarding.countryOffset', {
                    offset: countryOffset(selectedCountry()),
                  })
                }}
              </p>
            }
            <div class="mt-4">
              <app-schedule-picker
                [value]="form.controls.scheduleBlocks.value"
                [country]="selectedCountry()"
                (valueChange)="form.controls.scheduleBlocks.setValue($event)"
              />
            </div>
          </app-card>

          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('profile.styleContact') }}</h2>

            <div class="mt-4">
              <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.styleLabel') }}</p>
              <div class="grid gap-2 sm:grid-cols-3">
                @for (style of styles; track style) {
                  <button
                    type="button"
                    (click)="form.controls.playStyle.setValue(style)"
                    [class]="choiceClass(form.controls.playStyle.value === style)"
                  >
                    {{ i18n.t(STYLE_LABEL_KEYS[style]) }}
                  </button>
                }
              </div>
            </div>

            <div class="mt-4">
              <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.languagesLabel') }}</p>
              <div class="grid grid-cols-3 gap-2">
                @for (language of languages; track language) {
                  <button
                    type="button"
                    (click)="toggleLanguage(language)"
                    [class]="choiceClass(isLanguageSelected(language))"
                  >
                    {{ i18n.t(LANGUAGE_LABEL_KEYS[language]) }}
                  </button>
                }
              </div>
            </div>

            <div class="mt-4">
              <p class="mb-2 text-sm font-semibold">{{ i18n.t('onboarding.micLabel') }}</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="form.controls.hasMic.setValue(true)"
                  [class]="choiceClass(form.controls.hasMic.value)"
                >
                  {{ i18n.t('onboarding.micYes') }}
                </button>
                <button
                  type="button"
                  (click)="form.controls.hasMic.setValue(false)"
                  [class]="choiceClass(!form.controls.hasMic.value)"
                >
                  {{ i18n.t('onboarding.micNo') }}
                </button>
              </div>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <label class="grid gap-1.5 text-xs font-semibold text-muted">
                {{ i18n.t('onboarding.bioLabel') }}
                <textarea
                  formControlName="bio"
                  maxlength="280"
                  [placeholder]="i18n.t('onboarding.bioPlaceholder')"
                  class="min-h-[100px] resize-y rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                ></textarea>
                <span class="text-right text-[10px] font-normal">
                  {{ form.controls.bio.value.length }}/280
                </span>
              </label>
              <div class="grid gap-4">
                <app-text-input
                  formControlName="discordTag"
                  [label]="i18n.t('onboarding.discordLabel')"
                  [hint]="i18n.t('onboarding.discordHint')"
                  autocomplete="off"
                  placeholder="usuario"
                />
                <app-text-input
                  formControlName="whatsapp"
                  [label]="i18n.t('onboarding.whatsappLabel')"
                  [hint]="i18n.t('onboarding.whatsappHint')"
                  autocomplete="tel"
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
          </app-card>

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <app-button type="button" variant="secondary" (click)="goHome()">
              {{ i18n.t('profile.backHome') }}
            </app-button>
            <app-button type="submit" [loading]="saving()">
              {{ saving() ? i18n.t('profile.saving') : i18n.t('profile.save') }}
            </app-button>
          </div>
        </form>

        <app-card id="eliminar-cuenta" padding="lg">
          <h2 class="text-lg font-bold text-danger">{{ i18n.t('accountDelete.open') }}</h2>
          <p class="mt-2 text-sm text-muted">{{ i18n.t('accountDelete.hint') }}</p>
          <app-button class="mt-4" variant="danger" (click)="openDelete()">
            {{ i18n.t('accountDelete.open') }}
          </app-button>
        </app-card>

        <app-dialog
          [open]="deleteOpen()"
          [title]="i18n.t('accountDelete.title')"
          (closed)="closeDelete()"
        >
          <p class="text-sm leading-relaxed text-muted">
            {{ i18n.t('accountDelete.description') }}
          </p>
          <div class="mt-4">
            <app-text-input
              [formControl]="deletePassword"
              [label]="i18n.t('accountDelete.passwordLabel')"
              type="password"
              autocomplete="current-password"
              [error]="deletePasswordError()"
            />
          </div>
          @if (deleteError()) {
            <p class="mt-3 text-xs text-danger">{{ i18n.t('accountDelete.error') }}</p>
          }
          <div class="mt-5 flex justify-end gap-2">
            <app-button variant="secondary" (click)="closeDelete()">
              {{ i18n.t('accountDelete.cancel') }}
            </app-button>
            <app-button variant="danger" [loading]="deleting()" (click)="confirmDelete()">
              {{ deleting() ? i18n.t('accountDelete.deleting') : i18n.t('accountDelete.confirm') }}
            </app-button>
          </div>
        </app-dialog>
      }
    </div>
  `,
})
export class ProfilePage {
  private readonly profiles = inject(ProfilesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly ROLE_LABEL_KEYS = ROLE_LABEL_KEYS;
  protected readonly RANK_LABEL_KEYS = RANK_LABEL_KEYS;
  protected readonly DIVISION_LABEL_KEYS = DIVISION_LABEL_KEYS;
  protected readonly STYLE_LABEL_KEYS = STYLE_LABEL_KEYS;
  protected readonly LANGUAGE_LABEL_KEYS = LANGUAGE_LABEL_KEYS;
  protected readonly roles = PROFILE_ROLES;
  protected readonly rankTiers = PROFILE_RANK_TIERS;
  protected readonly divisions = PROFILE_RANK_DIVISIONS;
  protected readonly styles = PROFILE_PLAY_STYLES;
  protected readonly languages = PROFILE_LANGUAGES;

  protected readonly user = this.auth.user;
  protected readonly form = buildProfileForm();
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorKey = signal<TranslationKey | null>(null);
  protected readonly deleteOpen = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal(false);
  protected readonly deletePassword = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly countryOptions = (): SelectOption[] =>
    PROFILE_COUNTRIES.map((country) => ({
      value: country,
      label: this.i18n.t(COUNTRY_LABEL_KEYS[country]),
    }));

  protected readonly tierOptions = (): SelectOption[] =>
    PROFILE_RANK_TIERS.map((tier) => ({
      value: tier,
      label: this.i18n.t(RANK_LABEL_KEYS[tier]),
    }));

  protected readonly divisionOptions = (): SelectOption[] =>
    PROFILE_RANK_DIVISIONS.map((division) => ({
      value: division,
      label: this.i18n.t(DIVISION_LABEL_KEYS[division]),
    }));

  constructor() {
    this.profiles
      .getMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.profile) {
            void this.router.navigate(['/onboarding'], { replaceUrl: true });
            return;
          }
          patchProfileForm(this.form, response.profile);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorKey.set('profile.loadError');
        },
      });
  }

  protected roleButtonClass(selected: boolean): string {
    return `flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-[11px] font-semibold leading-tight transition ${
      selected
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border bg-bg text-muted hover:border-accent/50'
    }`;
  }

  protected rankButtonClass(selected: boolean): string {
    return `flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-semibold transition ${
      selected
        ? 'border-accent bg-accent/10 text-accent'
        : 'border-border text-muted hover:border-accent/50 hover:text-text'
    }`;
  }

  protected choiceClass(selected: boolean): string {
    return `rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
      selected
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border bg-bg text-muted hover:border-accent/50'
    }`;
  }

  protected setRankTier(tier: RankTier): void {
    this.form.controls.rankTier.setValue(tier);
    if (isApexTier(tier)) this.form.controls.rankDivision.setValue('');
  }

  protected onFlexTierChange(): void {
    if (
      !this.form.controls.flexRankTier.value ||
      isApexTier(this.form.controls.flexRankTier.value)
    ) {
      this.form.controls.flexRankDivision.setValue('');
    }
  }

  protected selectedCountry(): Country | null {
    const country = this.form.controls.country.value;
    return country ? (country as Country) : null;
  }

  protected countryOffset(country: Country | null): string {
    return formatCountryOffset(country);
  }

  protected isApex(): boolean {
    return isApexTier(this.form.controls.rankTier.value);
  }

  protected flexIsApex(): boolean {
    return isApexTier(this.form.controls.flexRankTier.value);
  }

  protected rolesConflict(): boolean {
    const primary = this.form.controls.primaryRole.value;
    return (
      Boolean(primary) && primary === this.form.controls.secondaryRole.value && primary !== 'fill'
    );
  }

  protected isLanguageSelected(language: Language): boolean {
    return this.form.controls.languages.value.includes(language);
  }

  protected toggleLanguage(language: Language): void {
    const current = this.form.controls.languages.value;
    this.form.controls.languages.setValue(
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language],
    );
  }

  protected save(): void {
    for (let step = 0; step <= 4; step += 1) {
      const error = profileStepError(this.form, step);
      if (error) {
        this.errorKey.set(error);
        return;
      }
    }

    this.saving.set(true);
    this.errorKey.set(null);

    this.profiles
      .updateMine(profilePayloadFromForm(this.form))
      .pipe(
        switchMap(() => this.auth.refreshProfile().pipe(catchError(() => of(null)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success(this.i18n.t('profile.saved'));
        },
        error: () => {
          this.saving.set(false);
          this.errorKey.set('profile.saveError');
        },
      });
  }

  protected goHome(): void {
    void this.router.navigate(['/inicio']);
  }

  protected openDelete(): void {
    this.deletePassword.reset('');
    this.deleteError.set(false);
    this.deleteOpen.set(true);
  }

  protected closeDelete(): void {
    if (this.deleting()) return;
    this.deleteOpen.set(false);
  }

  protected deletePasswordError(): string {
    return this.deletePassword.touched && this.deletePassword.hasError('required')
      ? this.i18n.t('accountDelete.passwordRequired')
      : '';
  }

  protected confirmDelete(): void {
    this.deletePassword.markAsTouched();
    if (this.deletePassword.invalid) return;

    this.deleting.set(true);
    this.deleteError.set(false);

    this.auth
      .deleteAccount(this.deletePassword.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.deleting.set(false);
          this.deleteOpen.set(false);
          this.auth.logout();
          void this.router.navigate(['/cuenta-eliminada'], {
            queryParams: { scheduledFor: response.deletionScheduledFor },
            replaceUrl: true,
          });
        },
        error: () => {
          this.deleting.set(false);
          this.deleteError.set(true);
        },
      });
  }
}
