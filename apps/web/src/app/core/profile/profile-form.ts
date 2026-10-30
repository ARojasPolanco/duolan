import { FormControl, FormGroup } from '@angular/forms';
import type {
  Country,
  Language,
  PlayStyle,
  RankDivision,
  RankTier,
  Role,
  ScheduleBlock,
} from '../api/models/enums';
import type { MyProfile, UpdateProfileRequest } from '../api/models/profile.model';
import type { TranslationKey } from '../i18n/translations';
import { RIOT_ID_REGEX, cleanRiotId, isApexTier } from './profile-options';

export interface ProfileFormControls {
  riotId: FormControl<string>;
  country: FormControl<string>;
  primaryRole: FormControl<string>;
  secondaryRole: FormControl<string>;
  rankTier: FormControl<string>;
  rankDivision: FormControl<string>;
  rankLp: FormControl<number | null>;
  flexRankTier: FormControl<string>;
  flexRankDivision: FormControl<string>;
  flexRankLp: FormControl<number | null>;
  playStyle: FormControl<string>;
  languages: FormControl<Language[]>;
  hasMic: FormControl<boolean>;
  scheduleBlocks: FormControl<ScheduleBlock[]>;
  bio: FormControl<string>;
  discordTag: FormControl<string>;
  whatsapp: FormControl<string>;
}

export type ProfileForm = FormGroup<ProfileFormControls>;

export const buildProfileForm = (): ProfileForm =>
  new FormGroup<ProfileFormControls>({
    riotId: new FormControl('', { nonNullable: true }),
    country: new FormControl('', { nonNullable: true }),
    primaryRole: new FormControl('', { nonNullable: true }),
    secondaryRole: new FormControl('', { nonNullable: true }),
    rankTier: new FormControl('', { nonNullable: true }),
    rankDivision: new FormControl('', { nonNullable: true }),
    rankLp: new FormControl<number | null>(null),
    flexRankTier: new FormControl('', { nonNullable: true }),
    flexRankDivision: new FormControl('', { nonNullable: true }),
    flexRankLp: new FormControl<number | null>(null),
    playStyle: new FormControl('', { nonNullable: true }),
    languages: new FormControl<Language[]>([], { nonNullable: true }),
    hasMic: new FormControl(false, { nonNullable: true }),
    scheduleBlocks: new FormControl<ScheduleBlock[]>([], { nonNullable: true }),
    bio: new FormControl('', { nonNullable: true }),
    discordTag: new FormControl('', { nonNullable: true }),
    whatsapp: new FormControl('', { nonNullable: true }),
  });

export const patchProfileForm = (form: ProfileForm, profile: MyProfile | null): void => {
  form.reset({
    riotId: profile?.riotId ?? '',
    country: profile?.country ?? '',
    primaryRole: profile?.primaryRole ?? '',
    secondaryRole: profile?.secondaryRole ?? '',
    rankTier: profile?.rankTier ?? '',
    rankDivision: profile?.rankDivision ?? '',
    rankLp: profile?.rankLp ?? null,
    flexRankTier: profile?.flexRankTier ?? '',
    flexRankDivision: profile?.flexRankDivision ?? '',
    flexRankLp: profile?.flexRankLp ?? null,
    playStyle: profile?.playStyle ?? '',
    languages: profile?.languages ?? [],
    hasMic: profile?.hasMic ?? false,
    scheduleBlocks: profile?.scheduleBlocks ?? [],
    bio: profile?.bio ?? '',
    discordTag: profile?.discordTag ?? '',
    whatsapp: profile?.whatsapp ?? '',
  });
};

export const profileStepError = (form: ProfileForm, step: number): TranslationKey | null => {
  const value = form.getRawValue();

  if (step === 0) {
    return RIOT_ID_REGEX.test(cleanRiotId(value.riotId)) ? null : 'onboarding.error.riotId';
  }

  if (step === 1) {
    if (!value.primaryRole) return 'onboarding.error.primaryRole';
    if (!value.secondaryRole) return 'onboarding.error.secondaryRole';
    if (value.primaryRole === value.secondaryRole && value.primaryRole !== 'fill') {
      return 'onboarding.distinctRoles';
    }
    return null;
  }

  if (step === 2) {
    if (!value.rankTier) return 'onboarding.error.rankTier';
    if (!isApexTier(value.rankTier) && !value.rankDivision) {
      return 'onboarding.error.rankDivision';
    }
    if (value.flexRankTier && !isApexTier(value.flexRankTier) && !value.flexRankDivision) {
      return 'onboarding.error.flexDivision';
    }
    return null;
  }

  if (step === 3) return value.scheduleBlocks.length ? null : 'onboarding.error.schedule';

  if (step === 4) {
    if (!value.playStyle) return 'onboarding.error.style';
    if (!value.languages.length) return 'onboarding.error.languages';
    return null;
  }

  if (step >= 5) return null;

  return null;
};

export const profilePayloadFromForm = (form: ProfileForm): UpdateProfileRequest => {
  const value = form.getRawValue();

  return {
    riotId: cleanRiotId(value.riotId),
    country: value.country ? (value.country as Country) : null,
    primaryRole: value.primaryRole as Role,
    secondaryRole: value.secondaryRole as Role,
    rankTier: value.rankTier as RankTier,
    rankDivision: isApexTier(value.rankTier) ? null : (value.rankDivision as RankDivision),
    rankLp: value.rankLp === null ? null : Number(value.rankLp),
    flexRankTier: value.flexRankTier ? (value.flexRankTier as RankTier) : null,
    flexRankDivision: value.flexRankTier
      ? isApexTier(value.flexRankTier)
        ? null
        : (value.flexRankDivision as RankDivision)
      : null,
    flexRankLp: value.flexRankTier && value.flexRankLp !== null ? Number(value.flexRankLp) : null,
    playStyle: value.playStyle as PlayStyle,
    languages: value.languages,
    hasMic: value.hasMic,
    scheduleBlocks: value.scheduleBlocks,
    bio: value.bio.trim() || null,
    discordTag: value.discordTag.trim() || null,
    whatsapp: value.whatsapp.trim() || null,
  };
};
