import { describe, expect, it } from 'vitest';
import { buildProfileForm, profilePayloadFromForm, profileStepError } from './profile-form';

const fillValidProfile = () => {
  const form = buildProfileForm();
  form.controls.riotId.setValue('Test#LAN');
  form.controls.country.setValue('MX');
  form.controls.primaryRole.setValue('mid');
  form.controls.secondaryRole.setValue('jungle');
  form.controls.rankTier.setValue('diamond');
  form.controls.rankDivision.setValue('ii');
  form.controls.rankLp.setValue(42);
  form.controls.playStyle.setValue('ranked');
  form.controls.languages.setValue(['es', 'en']);
  form.controls.hasMic.setValue(true);
  form.controls.scheduleBlocks.setValue(['mon_night', 'tue_night']);
  form.controls.bio.setValue('Busco duo.');
  form.controls.discordTag.setValue('tester');
  form.controls.whatsapp.setValue('+52 55 1234 5678');
  return form;
};

describe('profile form', () => {
  it('valida cada paso del onboarding', () => {
    const form = buildProfileForm();

    expect(profileStepError(form, 0)).toBe('onboarding.error.riotId');
    form.controls.riotId.setValue('Test#LAN');
    expect(profileStepError(form, 0)).toBeNull();

    expect(profileStepError(form, 1)).toBe('onboarding.error.primaryRole');
    form.controls.primaryRole.setValue('mid');
    form.controls.secondaryRole.setValue('mid');
    expect(profileStepError(form, 1)).toBe('onboarding.distinctRoles');
    form.controls.secondaryRole.setValue('jungle');
    expect(profileStepError(form, 1)).toBeNull();

    expect(profileStepError(form, 2)).toBe('onboarding.error.rankTier');
    form.controls.rankTier.setValue('diamond');
    expect(profileStepError(form, 2)).toBe('onboarding.error.rankDivision');
    form.controls.rankDivision.setValue('ii');
    expect(profileStepError(form, 2)).toBeNull();

    expect(profileStepError(form, 3)).toBe('onboarding.error.schedule');
    form.controls.scheduleBlocks.setValue(['mon_night']);
    expect(profileStepError(form, 3)).toBeNull();

    expect(profileStepError(form, 4)).toBe('onboarding.error.style');
    form.controls.playStyle.setValue('ranked');
    expect(profileStepError(form, 4)).toBe('onboarding.error.languages');
    form.controls.languages.setValue(['es']);
    expect(profileStepError(form, 4)).toBeNull();
  });

  it('construye el payload con nulos y rangos apex normalizados', () => {
    const form = fillValidProfile();
    form.controls.rankTier.setValue('master');
    form.controls.rankDivision.setValue('ii');
    form.controls.flexRankTier.setValue('diamond');
    form.controls.flexRankDivision.setValue('iv');
    form.controls.flexRankLp.setValue(10);
    form.controls.country.setValue('');

    const payload = profilePayloadFromForm(form);

    expect(payload.rankDivision).toBeNull();
    expect(payload.country).toBeNull();
    expect(payload.flexRankTier).toBe('diamond');
    expect(payload.flexRankDivision).toBe('iv');
    expect(payload.flexRankLp).toBe(10);
    expect(payload.riotId).toBe('Test#LAN');
    expect(payload.scheduleBlocks).toEqual(['mon_night', 'tue_night']);
  });

  it('permite Comodín repetido en ambos roles', () => {
    const form = fillValidProfile();
    form.controls.primaryRole.setValue('fill');
    form.controls.secondaryRole.setValue('fill');

    expect(profileStepError(form, 1)).toBeNull();
  });
});
