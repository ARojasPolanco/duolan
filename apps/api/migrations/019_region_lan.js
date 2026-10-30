const LAN_COUNTRIES =
  "'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'DO', 'PR', 'CO', 'VE', 'EC', 'PE'";
const LAS_COUNTRIES = "'AR', 'CL', 'BO', 'PY', 'UY', 'PE'";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.query(`
    ALTER TABLE player_profiles
      DROP CONSTRAINT IF EXISTS player_profiles_server_check;
    ALTER TABLE player_profiles
      ADD CONSTRAINT player_profiles_server_check
      CHECK (server IN ('LAS', 'LAN'));
    ALTER TABLE player_profiles
      ALTER COLUMN server SET DEFAULT 'LAN';
    ALTER TABLE player_profiles
      DROP CONSTRAINT IF EXISTS player_profiles_country_check;
    ALTER TABLE player_profiles
      ADD CONSTRAINT player_profiles_country_check
      CHECK (country IS NULL OR country IN (${LAN_COUNTRIES}));
  `);
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.query(`
    UPDATE player_profiles
      SET country = NULL
      WHERE country IS NOT NULL AND country NOT IN (${LAS_COUNTRIES});
    ALTER TABLE player_profiles
      DROP CONSTRAINT IF EXISTS player_profiles_country_check;
    ALTER TABLE player_profiles
      ADD CONSTRAINT player_profiles_country_check
      CHECK (country IS NULL OR country IN (${LAS_COUNTRIES}));
    UPDATE player_profiles SET server = 'LAS' WHERE server = 'LAN';
    ALTER TABLE player_profiles
      DROP CONSTRAINT IF EXISTS player_profiles_server_check;
    ALTER TABLE player_profiles
      ADD CONSTRAINT player_profiles_server_check
      CHECK (server = 'LAS');
    ALTER TABLE player_profiles
      ALTER COLUMN server SET DEFAULT 'LAS';
  `);
}
