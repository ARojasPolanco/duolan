import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import type {
  Country,
  Language,
  PlayStyle,
  RankDivision,
  RankTier,
  Role,
} from '../../../core/api/models/enums';
import type { SelectOption } from '../../../shared/ui/select.component';
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
import { ProfilesService } from '../../../core/api/profiles.service';
import { ToastService } from '../../../core/toast/toast.service';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { RoleIconComponent } from '../../../shared/icons/role-icon.component';
import { SchedulePickerComponent } from '../../../shared/profile/schedule-picker.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';
import { SelectComponent } from '../../../shared/ui/select.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

const STEP_KEYS: TranslationKey[] = [
  'onboarding.step.riot',
  'onboarding.step.roles',
  'onboarding.step.rank',
  'onboarding.step.schedule',
  'onboarding.step.style',
  'onboarding.step.contact',
  'onboarding.step.summary',
];

@Component({
  selector: 'app-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RankIconComponent,
    RoleIconComponent,
    SchedulePickerComponent,
    ButtonComponent,
    CardComponent,
    LanguageToggleComponent,
    SelectComponent,
    TextInputComponent,
    EmailVerificationBannerComponent,
  ],
  template: `
    <div class="min-h-screen bg-bg px-5 py-8 text-text">
      <div class="mx-auto max-w-3xl space-y-5">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <span class="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            Duo<span class="text-accent">LAN</span>
          </span>
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold text-muted">
              {{ i18n.t('onboarding.stepOf', { current: step() + 1, total: 7 }) }}
            </span>
            <app-language-toggle />
          </div>
        </header>

        <div class="h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            class="h-full rounded-full bg-accent transition-all"
            [style.width.%]="progress()"
          ></div>
        </div>

        <app-email-verification-banner />

        @if (loading()) {
          <div class="flex min-h-[50vh] items-center justify-center">
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"
            ></div>
          </div>
        } @else {
          <app-card padding="lg">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {{ i18n.t(STEP_KEYS[step()]) }}
            </p>

            @if (errorKey()) {
              <p
                class="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {{ i18n.t(errorKey()!) }}
              </p>
            }

            <form class="mt-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
              @switch (step()) {
                @case (0) {
                  <div class="grid gap-5">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.riot.title') }}</h1>
                      <p class="mt-2 text-sm leading-relaxed text-muted">
                        {{ i18n.t('onboarding.riot.body') }}
                      </p>
                    </div>

                    <app-text-input
                      formControlName="riotId"
                      [label]="i18n.t('onboarding.riotIdLabel')"
                      [placeholder]="i18n.t('onboarding.riotIdPlaceholder')"
                      autocomplete="off"
                      [hint]="i18n.t('onboarding.riotHint')"
                    />

                    <div class="rounded-xl border border-border bg-bg px-4 py-3 text-sm">
                      <span class="text-muted">{{ i18n.t('onboarding.serverLabel') }}: </span>
                      <span class="font-semibold">LAN</span>
                    </div>
                  </div>
                }

                @case (1) {
                  <div class="grid gap-6">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.roles.title') }}</h1>
                      <p class="mt-2 text-sm text-muted">{{ i18n.t('onboarding.roles.body') }}</p>
                    </div>

                    <div>
                      <p class="mb-2 text-sm font-semibold">
                        {{ i18n.t('onboarding.primaryRole') }}
                      </p>
                      <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        @for (role of roles; track role) {
                          <button
                            type="button"
                            (click)="setPrimaryRole(role)"
                            [class]="roleButtonClass(form.controls.primaryRole.value === role)"
                          >
                            <app-role-icon [role]="role" [size]="20" />
                            <span>{{ i18n.t(ROLE_LABEL_KEYS[role]) }}</span>
                          </button>
                        }
                      </div>
                    </div>

                    <div>
                      <p class="mb-2 text-sm font-semibold">
                        {{ i18n.t('onboarding.secondaryRole') }}
                      </p>
                      <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        @for (role of roles; track role) {
                          <button
                            type="button"
                            (click)="setSecondaryRole(role)"
                            [class]="roleButtonClass(form.controls.secondaryRole.value === role)"
                          >
                            <app-role-icon [role]="role" [size]="20" />
                            <span>{{ i18n.t(ROLE_LABEL_KEYS[role]) }}</span>
                          </button>
                        }
                      </div>
                    </div>

                    @if (rolesConflict()) {
                      <p class="text-sm text-danger">{{ i18n.t('onboarding.distinctRoles') }}</p>
                    }
                  </div>
                }

                @case (2) {
                  <div class="grid gap-5">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.rank.title') }}</h1>
                      <p class="mt-2 text-sm text-muted">{{ i18n.t('onboarding.rank.body') }}</p>
                    </div>

                    <div>
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
                      <div>
                        <p class="mb-2 text-sm font-semibold">
                          {{ i18n.t('onboarding.division') }}
                        </p>
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

                    <label class="grid gap-1.5 text-xs font-semibold text-muted">
                      {{ i18n.t('onboarding.lp') }}
                      <input
                        type="number"
                        min="0"
                        formControlName="rankLp"
                        class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                      />
                    </label>

                    <div class="rounded-2xl border border-border bg-bg p-4">
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
                  </div>
                }

                @case (3) {
                  <div class="grid gap-5">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.schedule.title') }}</h1>
                      <p class="mt-2 text-sm text-muted">
                        {{ i18n.t('onboarding.schedule.body') }}
                      </p>
                    </div>

                    <div class="rounded-2xl border border-border bg-bg p-4">
                      <app-select
                        formControlName="country"
                        [label]="i18n.t('onboarding.countryLabel')"
                        [placeholder]="i18n.t('onboarding.countryUnspecified')"
                        [hint]="i18n.t('onboarding.countryHint')"
                        [options]="countryOptions()"
                      />
                    </div>

                    <app-schedule-picker
                      [value]="form.controls.scheduleBlocks.value"
                      (valueChange)="form.controls.scheduleBlocks.setValue($event)"
                    />
                  </div>
                }

                @case (4) {
                  <div class="grid gap-6">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.style.title') }}</h1>
                      <p class="mt-2 text-sm text-muted">{{ i18n.t('onboarding.style.body') }}</p>
                    </div>

                    <div>
                      <p class="mb-2 text-sm font-semibold">
                        {{ i18n.t('onboarding.styleLabel') }}
                      </p>
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

                    <div>
                      <p class="mb-2 text-sm font-semibold">
                        {{ i18n.t('onboarding.languagesLabel') }}
                      </p>
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

                    <div>
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
                  </div>
                }

                @case (5) {
                  <div class="grid gap-5">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.contact.title') }}</h1>
                      <p class="mt-2 text-sm leading-relaxed text-muted">
                        {{ i18n.t('onboarding.contact.body') }}
                      </p>
                    </div>

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
                }

                @case (6) {
                  <div class="grid gap-5">
                    <div>
                      <h1 class="text-2xl font-bold">{{ i18n.t('onboarding.summary.title') }}</h1>
                      <p class="mt-2 text-sm text-muted">{{ i18n.t('onboarding.summary.body') }}</p>
                    </div>

                    <dl class="grid gap-2 rounded-xl border border-border bg-bg p-4 text-sm">
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.riotId') }}</dt>
                        <dd class="text-muted">{{ form.controls.riotId.value || '-' }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.country') }}</dt>
                        <dd class="text-muted">{{ countryLabel() }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.roles') }}</dt>
                        <dd class="text-muted">{{ rolesLabel() }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.soloRank') }}</dt>
                        <dd class="text-muted">{{ soloRankLabel() }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.flexRank') }}</dt>
                        <dd class="text-muted">{{ flexRankLabel() }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.schedule') }}</dt>
                        <dd class="text-muted">{{ form.controls.scheduleBlocks.value.length }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.style') }}</dt>
                        <dd class="text-muted">{{ styleLabel() }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.languages') }}</dt>
                        <dd class="text-muted">{{ languagesLabel() }}</dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.mic') }}</dt>
                        <dd class="text-muted">
                          {{
                            form.controls.hasMic.value ? i18n.t('label.yes') : i18n.t('label.no')
                          }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.discord') }}</dt>
                        <dd class="text-muted">
                          {{ form.controls.discordTag.value || i18n.t('label.unspecified') }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-[120px_1fr] gap-2">
                        <dt class="font-semibold">{{ i18n.t('onboarding.summary.whatsapp') }}</dt>
                        <dd class="text-muted">
                          {{ form.controls.whatsapp.value || i18n.t('label.unspecified') }}
                        </dd>
                      </div>
                    </dl>

                    @if (
                      !form.controls.discordTag.value.trim() && !form.controls.whatsapp.value.trim()
                    ) {
                      <p
                        class="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-gold"
                      >
                        {{ i18n.t('onboarding.noContacts') }}
                      </p>
                    }

                    <p class="text-xs text-muted">{{ i18n.t('onboarding.visibility') }}</p>
                  </div>
                }
              }

              <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                @if (step() > 0) {
                  <app-button type="button" variant="secondary" (click)="back()">
                    {{ i18n.t('onboarding.back') }}
                  </app-button>
                } @else {
                  <span></span>
                }

                @if (step() < 6) {
                  <app-button type="button" (click)="next()">
                    {{ i18n.t('onboarding.continue') }}
                  </app-button>
                } @else {
                  <app-button type="submit" [loading]="saving()">
                    {{ saving() ? i18n.t('onboarding.saving') : i18n.t('onboarding.save') }}
                  </app-button>
                }
              </div>
            </form>
          </app-card>
        }
      </div>
    </div>
  `,
})
export class OnboardingPage {
  private readonly profiles = inject(ProfilesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly STEP_KEYS = STEP_KEYS;
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

  protected readonly form = buildProfileForm();
  protected readonly step = signal(0);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorKey = signal<TranslationKey | null>(null);

  protected readonly progress = () => ((this.step() + 1) / 7) * 100;

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
          patchProfileForm(this.form, response.profile);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorKey.set('onboarding.loadError');
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

  protected setPrimaryRole(role: Role): void {
    this.form.controls.primaryRole.setValue(role);
  }

  protected setSecondaryRole(role: Role): void {
    this.form.controls.secondaryRole.setValue(role);
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

  protected next(): void {
    const error = profileStepError(this.form, this.step());
    if (error) {
      this.errorKey.set(error);
      return;
    }
    this.errorKey.set(null);
    this.step.update((current) => Math.min(current + 1, 6));
  }

  protected back(): void {
    this.errorKey.set(null);
    this.step.update((current) => Math.max(current - 1, 0));
  }

  protected submit(): void {
    for (let step = 0; step <= 4; step += 1) {
      const error = profileStepError(this.form, step);
      if (error) {
        this.step.set(step);
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
          this.toast.success(this.i18n.t('onboarding.saved'));
          void this.router.navigate(['/inicio'], { replaceUrl: true });
        },
        error: () => {
          this.saving.set(false);
          this.errorKey.set('onboarding.error.save');
        },
      });
  }

  protected countryLabel(): string {
    const country = this.form.controls.country.value as Country | '';
    return country ? this.i18n.t(COUNTRY_LABEL_KEYS[country]) : this.i18n.t('label.unspecified');
  }

  protected rolesLabel(): string {
    const primary = this.form.controls.primaryRole.value as Role | '';
    const secondary = this.form.controls.secondaryRole.value as Role | '';
    if (!primary) return '-';
    return `${this.i18n.t(ROLE_LABEL_KEYS[primary])} / ${
      secondary ? this.i18n.t(ROLE_LABEL_KEYS[secondary]) : '-'
    }`;
  }

  protected soloRankLabel(): string {
    return this.rankLabel(
      this.form.controls.rankTier.value as RankTier | '',
      this.form.controls.rankDivision.value as RankDivision | '',
    );
  }

  protected flexRankLabel(): string {
    if (!this.form.controls.flexRankTier.value) return this.i18n.t('label.notDeclared');
    return this.rankLabel(
      this.form.controls.flexRankTier.value as RankTier,
      this.form.controls.flexRankDivision.value as RankDivision | '',
    );
  }

  protected styleLabel(): string {
    const style = this.form.controls.playStyle.value as PlayStyle | '';
    return style ? this.i18n.t(STYLE_LABEL_KEYS[style]) : '-';
  }

  protected languagesLabel(): string {
    const languages = this.form.controls.languages.value;
    return languages.length
      ? languages.map((language) => this.i18n.t(LANGUAGE_LABEL_KEYS[language])).join(', ')
      : '-';
  }

  private rankLabel(tier: RankTier | '', division: RankDivision | ''): string {
    if (!tier) return '-';
    const tierLabel = this.i18n.t(RANK_LABEL_KEYS[tier]);
    const divisionLabel = division ? this.i18n.t(DIVISION_LABEL_KEYS[division]) : '';
    return divisionLabel ? `${tierLabel} ${divisionLabel}` : tierLabel;
  }
}
