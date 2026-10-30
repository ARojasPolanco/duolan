import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { COUNTRIES, COUNTRY_TIMEZONES, GAME_SERVERS, TIMEZONE } from '@duolan/shared';
import app from '../app.js';
import { envs } from '../config/enviroments.js';
import sequelize from '../config/database/database.js';
import { runMigrations } from '../config/database/migrator.js';
import PlayerProfile from '../modules/profiles/profile.model.js';
import { authHeader, createMatchUser } from './helpers/fixtures.js';

const api = request(app);

beforeAll(async () => {
  try {
    await sequelize.authenticate();
  } catch (_error) {
    throw new Error(
      'La base de datos de test no está disponible. Levantá PostgreSQL con npm run docker:up.'
    );
  }

  await runMigrations();
});

describe('Configuración LAN', () => {
  it('usa LAN como servidor operativo y permite LAS/LAN en el modelo', () => {
    expect(envs.GAME_SERVER).toBe('LAN');
    expect(GAME_SERVERS).toEqual(['LAS', 'LAN']);
  });

  it('define países y timezones de LAN con México como referencia', () => {
    expect(TIMEZONE).toBe('America/Mexico_City');
    expect(COUNTRIES).toContain('MX');
    expect(COUNTRIES).toContain('CO');
    expect(COUNTRIES).not.toContain('AR');
    expect(Object.keys(COUNTRY_TIMEZONES).sort()).toEqual([...COUNTRIES].sort());
    expect(COUNTRY_TIMEZONES.MX).toBe('America/Mexico_City');
  });

  it('devuelve Duo LAN API v1 en la raíz', async () => {
    const res = await api.get('/api/v1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Duo LAN API v1');
  });

  it('guarda los perfiles nuevos con server LAN', async () => {
    const account = await createMatchUser({ country: 'MX' });

    const profile = await PlayerProfile.findOne({ where: { userId: account.user.id } });

    expect(account.profileResponse.status).toBe(200);
    expect(profile.server).toBe('LAN');
    expect(profile.country).toBe('MX');
  });

  it('excluye perfiles LAS del matching aunque existan en la DB', async () => {
    const viewer = await createMatchUser({
      scheduleBlocks: ['sun_early'],
      primaryRole: 'mid',
      secondaryRole: 'jungle',
    });
    const lanTarget = await createMatchUser({
      scheduleBlocks: ['sun_early'],
      primaryRole: 'jungle',
      secondaryRole: 'top',
    });
    const lasTarget = await createMatchUser({
      scheduleBlocks: ['sun_early'],
      primaryRole: 'jungle',
      secondaryRole: 'top',
    });

    await PlayerProfile.update({ server: 'LAS' }, { where: { userId: lasTarget.user.id } });

    const res = await api.get('/api/v1/matching/candidates?limit=50').set(authHeader(viewer.token));
    const ids = res.body.candidates.map((candidate) => candidate.profile.id);

    expect(res.status).toBe(200);
    expect(ids).toContain(lanTarget.user.id);
    expect(ids).not.toContain(lasTarget.user.id);
  });

  it('la migración deja el default LAN y acepta LAS/LAN', async () => {
    const [columns] = await sequelize.query(
      `SELECT column_default FROM information_schema.columns
       WHERE table_name = 'player_profiles' AND column_name = 'server'`
    );
    const [constraints] = await sequelize.query(
      `SELECT pg_get_constraintdef(oid) AS definition
       FROM pg_constraint WHERE conname = 'player_profiles_server_check'`
    );

    expect(columns[0].column_default).toContain('LAN');
    expect(constraints[0].definition).toContain("'LAS'");
    expect(constraints[0].definition).toContain("'LAN'");
  });

  it('el seed de demo usa Riot IDs #LAN y no conserva branding LAS', () => {
    const seed = readFileSync(new URL('../../seeders/run-seed.js', import.meta.url), 'utf8');

    expect(seed).toContain('#LAN');
    expect(seed).not.toContain('#LAS');
    expect(seed).not.toContain('duolas.online');
    expect(seed).toContain('server: envs.GAME_SERVER');
  });
});
