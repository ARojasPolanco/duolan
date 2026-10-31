# Duo LAN

Web mobile-first, gratuita y solo para mayores de 18 años, que conecta jugadores de League of Legends del servidor **LAN** para jugar duo y subir de elo.

Duo LAN es un producto separado de Duo LAS. No comparte base de datos, secretos, JWT, VAPID, hCaptcha, Resend, Render ni Vercel con Duo LAS. Esta instancia atiende únicamente LAN.

## Estado

- **Fase actual:** Fases 0 a 6 completadas en local. Siguiente: deploy de la web y Fase 7 (infra, servicios y DNS).
- **Backend:** copia adaptada de Duo LAS con `GAME_SERVER=LAN`, migración `019_region_lan`, países LAN, timezone `America/Mexico_City` y branding Duo LAN.
- **Frontend:** Angular 21 con público, auth, onboarding, perfil, match, matches, disponibilidad, invitaciones, Busco 1, ARAM, notificaciones, SSE/push y admin.
- **Base de datos:** PostgreSQL 16 local o Neon. Sin datos migrados desde Duo LAS.
- **Tests:** 133 de API y 43 de Angular; lint, build y smoke local verdes.
- **Deploy:** configuración de producción preparada. Pendientes claves externas, Render, Neon, Vercel, DNS y SSL.
- **Ramas:** `dev` publicada en `origin/dev`; `main` se crea para el release final.

La fuente de verdad del plan es `task2.md`. Las reglas operativas están en `agent2.md`.

## Stack

| Capa          | Tecnología                                                      |
| ------------- | --------------------------------------------------------------- |
| Monorepo      | npm workspaces (`apps/api`, `apps/web`, `packages/shared`)      |
| Runtime       | Node.js 22 LTS                                                  |
| Backend       | JavaScript puro con ESM + Express 4 + Sequelize 6               |
| Migraciones   | Umzug con SQL crudo y migraciones numeradas                     |
| Base de datos | PostgreSQL 16 (local), Neon en producción                       |
| Validación    | Zod en cada módulo + constantes compartidas                     |
| Auth          | JWT (1 día) + bcrypt (12 rounds) + verificación por email       |
| Email         | Resend                                                          |
| CAPTCHA       | hCaptcha                                                        |
| Realtime      | SSE en memoria + polling de respaldo. Sin Redis.                |
| Push          | `web-push` + VAPID + service worker + PWA                       |
| Frontend      | Angular 21 + TypeScript estricto + Tailwind CSS 4               |
| Estado        | Signals + servicios. Sin NgRx.                                  |
| HTTP          | `HttpClient` + interceptores funcionales                        |
| Tests         | Vitest + Supertest en API; Vitest en Angular                    |
| Deploy        | API en Render, web en Vercel, PostgreSQL en Neon, DNS Hostinger |

No se usa TypeScript en el backend. No se usa Prisma. No se usa Redis en el MVP. No se usa SSR de Angular en la primera versión.

## Estructura

```text
duolan/
├─ apps/
│  ├─ api/
│  │  ├─ migrations/
│  │  ├─ seeders/
│  │  ├─ src/
│  │  └─ vitest.config.js
│  └─ web/
│     ├─ public/
│     └─ src/
│        ├─ app/
│        │  ├─ core/
│        │  ├─ shared/
│        │  └─ features/
│        ├─ environments/
│        └─ styles.css
├─ packages/
│  └─ shared/
├─ docker/
│  └─ initdb/
├─ docs/
├─ docker-compose.yml
├─ agent2.md
├─ task2.md
└─ README.md
```

## Quick start

Requisitos: Node.js 22 LTS, npm 10+ y Docker Desktop.

```bash
npm install
npm run docker:up
cp apps/api/.env.example apps/api/.env
npm run dev
npm run dev:web
```

- API: `http://localhost:3000`
- API health: `http://localhost:3000/health`
- Web Angular: `http://localhost:4200`
- PostgreSQL: `localhost:5433`

El proxy de Angular envía `/api` a `http://localhost:3000`. El archivo `apps/api/.env` es local y no se commitea.

## Tests, lint y build

```bash
npm test          # Vitest + Supertest contra duolan_test
npm run test:web  # Tests de Angular
npm run lint      # ESLint de API/shared + ng lint
npm run build     # Build de producción de Angular
npm run build:api # Chequeo de sintaxis de la API
```

Los tests de la API requieren `TEST_DB_URI` apuntando a `duolan_test`. La base se crea con el `initdb` de Docker la primera vez que se inicializa el volumen.

## Seeds

El seed de desarrollo crea cuentas verificadas, perfiles completos con Riot IDs `#LAN`, un match activo y contenido de prueba. No se ejecuta en producción.

```bash
npm run docker:up
npm run seed
```

| Cuenta                       | Contraseña   | Uso                                           |
| ---------------------------- | ------------ | --------------------------------------------- |
| `demo_mid@duolan.online`     | `Demo12345!` | Cuenta principal para probar Match y Matches  |
| `demo_jungle@duolan.online`  | `Demo12345!` | Tiene un match activo con `demo_mid`          |
| `demo_adc@duolan.online`     | `Demo12345!` | Candidato con like pendiente hacia `demo_mid` |
| `demo_support@duolan.online` | `Demo12345!` | Candidato compatible adicional                |
| `demo_admin@duolan.online`   | `Demo12345!` | Admin de reportes y sanciones                 |

El admin real se crea solo con `npm run seed:admin` y `ADMIN_EMAIL`/`ADMIN_PASSWORD` configurados fuera del repositorio.

## Reglas de LAN

- `GAME_SERVER=LAN` es obligatorio en la API.
- La zona horaria de referencia es `America/Mexico_City`.
- Las fechas se guardan en UTC y la UI muestra la equivalencia según el país del usuario.
- El modelo permite `server IN ('LAS', 'LAN')`, pero esta instancia solo crea perfiles `LAN`.
- El matching filtra por `envs.GAME_SERVER`.
- `RIOT_PLATFORM=la1`.
- Los seeds usan Riot IDs terminados en `#LAN`.
- Todo texto visible dice **Duo LAN** o **LAN**.
- La jurisdicción legal es Argentina.

## Scripts

| Comando               | Descripción                              |
| --------------------- | ---------------------------------------- |
| `npm run docker:up`   | Levanta PostgreSQL                       |
| `npm run docker:down` | Baja PostgreSQL                          |
| `npm run docker:app`  | Levanta PostgreSQL, API y web en Docker  |
| `npm run dev`         | API con recarga                          |
| `npm run dev:web`     | Angular en modo desarrollo               |
| `npm test`            | Vitest + Supertest                       |
| `npm run test:web`    | Tests de Angular                         |
| `npm run lint`        | ESLint                                   |
| `npm run format`      | Prettier                                 |
| `npm run build`       | Build de producción de Angular           |
| `npm run seed`        | Datos de desarrollo                      |
| `npm run seed:admin`  | Crea el admin desde variables de entorno |

## Documentación

| Documento                  | Contenido                                                 |
| -------------------------- | --------------------------------------------------------- |
| `agent2.md`                | Convenciones obligatorias y reglas críticas               |
| `task2.md`                 | Tablero vivo y plan por fases                             |
| `docs/SPEC.md`             | Producto, alcance, flujos y reglas de negocio             |
| `docs/ARCHITECTURE.md`     | Arquitectura técnica, errores, realtime, push y operación |
| `docs/DATA-MODEL.md`       | Tablas, enums, índices y migraciones                      |
| `docs/API.md`              | Contrato de endpoints y catálogo de errores               |
| `docs/ROUTES.md`           | Rutas web/API y flujos de prueba                          |
| `docs/MATCHING.md`         | Fórmulas, filtros y pesos del match                       |
| `docs/METRICS.md`          | Eventos, KPIs y consultas SQL                             |
| `docs/TESTING.md`          | Plan de pruebas y smoke manual                            |
| `docs/PRODUCTION.md`       | Checklist de envs, claves y deploy a producción           |
| `docs/RIOT-INTEGRATION.md` | Preparación de Riot API, key y revisión                   |
| `docs/UI.md`               | Rutas, pantallas, componentes y copy                      |
| `docs/DECISIONS.md`        | Registro de decisiones (ADR)                              |

## Aviso legal

Duo LAN isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## Licencia

Sin licencia definida todavía.
