# AGENT2.md — DuoLAN

Documento operativo obligatorio para cualquier persona o agente que trabaje en el repositorio **DuoLAN**. Si una regla de este archivo choca con una decisión nueva, primero se actualiza este documento o `task2.md` y después el código.

Este archivo reemplaza a `AGENTS.md` de Duo LAS. DuoLAN es un producto separado: no comparte base de datos, secretos, servicios ni dominio con Duo LAS.

## 1. Contexto del producto

DuoLAN es una web mobile-first, gratuita y solo para mayores de 18 años, que conecta jugadores de League of Legends del servidor **LAN** para jugar duo y subir de elo. Incluye perfil, match por afinidad, "Disponible ya", "Busco 1", ARAM, invitaciones, notificaciones, reputación, reportes y bloqueos.

Quedan fuera del alcance: coaching, pagos, Mercado Pago, chat interno, equipos/clanes, otros juegos, otros servidores, app nativa, Riot API/RSO y duo boost.

La marca visible es **Duo LAN**. El dominio es `duolan.online`. La API vive en `api.duolan.online`. La jurisdicción legal continúa siendo Argentina por decisión de producto.

## 2. Estado del repositorio

- Repositorio completamente nuevo, con historia Git limpia.
- Backend base copiado del repositorio Duo LAS y adaptado a LAN.
- Frontend nuevo en Angular + TypeScript con paridad funcional completa.
- Infraestructura separada: Neon, Render, Vercel, Resend, hCaptcha y VAPID nuevos.
- Sin datos migrados desde Duo LAS.
- Sin multi-región: esta instancia atiende únicamente LAN.
- Toda decisión de producto y técnica se registra en `docs/DECISIONS.md` y en `task2.md`.

## 3. Orden de lectura obligatorio

1. `task2.md`
2. `README.md`
3. `docs/SPEC.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DATA-MODEL.md`
6. `docs/API.md`
7. `docs/ROUTES.md`
8. `docs/MATCHING.md`
9. `docs/METRICS.md`
10. `docs/TESTING.md`
11. `docs/PRODUCTION.md`
12. `docs/RIOT-INTEGRATION.md`
13. `docs/UI.md`
14. `docs/DECISIONS.md`

## 4. Stack

| Capa          | Tecnología                                                         |
| ------------- | ------------------------------------------------------------------ |
| Monorepo      | npm workspaces (`apps/api`, `apps/web`, `packages/shared`)         |
| Runtime       | Node.js 22 LTS                                                     |
| Backend       | JavaScript puro con ESM + Express 4 + Sequelize 6                  |
| Migraciones   | Umzug con SQL crudo y migraciones numeradas                        |
| Base de datos | PostgreSQL 16 en Neon                                              |
| Validación    | Zod en cada módulo + constantes compartidas                        |
| Auth          | JWT (1 día) + bcrypt (12 rounds) + verificación por email          |
| Email         | Resend                                                             |
| CAPTCHA       | hCaptcha                                                           |
| Realtime      | SSE en memoria + polling de respaldo. Sin Redis.                   |
| Push          | `web-push` + VAPID + service worker + PWA                          |
| Frontend      | Angular moderno + TypeScript estricto + Tailwind CSS 4             |
| Estado        | Signals + servicios. Sin NgRx en la primera versión.               |
| Forms         | Reactive Forms                                                     |
| HTTP          | `HttpClient` + interceptores funcionales                           |
| UI auxiliar   | `lucide-angular` o SVG propios + sistema de toasts                 |
| Tests         | Vitest + Supertest en API; runner de Angular en web                |
| Deploy        | API en Render, web en Vercel, PostgreSQL en Neon, DNS en Hostinger |

No se usa TypeScript en el backend. No se usa Prisma. No se usa Redis en el MVP. No se usa SSR de Angular en la primera versión.

## 5. Estructura planificada

```text
duolan/
├─ apps/
│  ├─ api/
│  │  ├─ migrations/
│  │  ├─ seeders/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ errors/
│  │  │  ├─ middlewares/
│  │  │  ├─ modules/
│  │  │  ├─ routes/
│  │  │  ├─ app.js
│  │  │  └─ index.js
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

## 6. Reglas específicas de LAN

- `GAME_SERVER=LAN` es obligatorio en la API.
- La zona horaria de referencia de la interfaz es `America/Mexico_City`.
- Las fechas en DB siguen en UTC (`TIMESTAMPTZ`).
- Los horarios de disponibilidad se muestran según el país del usuario, usando la referencia de LAN.
- `TIMEZONE` del paquete compartido debe ser `America/Mexico_City`.
- `COUNTRIES` y `COUNTRY_TIMEZONES` deben reflejar los países de LAN. No reutilizar la lista de LAS.
- El backend debe filtrar perfiles y matching por `server: 'LAN'`.
- El modelo y la DB deben permitir `LAS` y `LAN` para mantener el código reusable, pero esta instancia solo crea perfiles `LAN`.
- Los seeds usan Riot IDs terminados en `#LAN`.
- `RIOT_PLATFORM` para integración futura debe ser `la1`, no `la2`.
- Todo texto visible debe decir **Duo LAN** o **LAN**, no **Duo LAS** ni **LAS**.
- Los enlaces de email usan `APP_URL=https://duolan.online`.
- El remitente y soporte deben usar el dominio `duolan.online` salvo decisión explícita distinta.
- `ADMIN_EMAIL` usa el mismo email que Duo LAS, pero se configura solo en Render y nunca se commitea.
- La jurisdicción de los legales sigue siendo Argentina.
- No se migran datos de Duo LAS.
- No se comparte base de datos, JWT, VAPID, hCaptcha, Resend, Render ni Vercel con Duo LAS.

## 7. Convenciones del backend

- JavaScript puro, ESM, `"type": "module"`.
- Imports con extensión `.js` explícita.
- Comillas simples, punto y coma, `trailingComma: "es5"`, `printWidth: 100`, 2 espacios.
- Archivos `camelCase.js`; modelos Sequelize en `PascalCase.js`.
- Env: `SCREAMING_SNAKE_CASE`.
- Prohibido `process.env.X` directo: usar `envs.X`.
- Código autodescriptivo. Comentarios solo para decisiones no obvias, invariantes o riesgos.
- Soft delete: `is_deleted` en entidades persistentes.
- No hardcodear IDs, emails, owners ni admins.
- No se guardan Riot IDs históricos.
- El Riot ID, el Discord y el WhatsApp se revelan únicamente después de una conexión.

### Patrón backend

```text
Route → Controller (catchAsync) → Service → Model
                  ↘ Validación Zod → 422
                  ↘ AppError → globalErrorHandler
```

- Los controllers no acceden a modelos directamente.
- Las transacciones viven en servicios.
- Los errores de unicidad se mapean a 409 sin exponer PostgreSQL.
- Los errores de SSE se manejan después de enviar headers: cerrar el stream y loguear.
- Los errores de push no rompen la request que los origina.

## 8. Validación y errores

- Zod por módulo, con `.strict()` en escrituras.
- `validateX()` devuelve `{ hasError, errorMessages, data }`.
- 422 para validación Zod.
- 400 para entradas inválidas que no son de esquema.
- 401 para falta de token, token inválido/expirado o credenciales incorrectas.
- 403 para suspendido, email sin verificar, rol insuficiente o falta de ownership.
- 404 para recurso inexistente o ajeno cuando corresponda ocultarlo.
- 409 para conflictos de estado.
- 429 para rate limit.
- 500 para errores inesperados, con redacción.
- Nunca loguear tokens, tickets SSE, contraseñas ni emails completos.

## 9. Auth y seguridad

- bcrypt con 12 rounds.
- JWT de 1 día, sin refresh token. Payload mínimo: `{ id, role }`.
- `protect` valida token, usuario existente, no borrado, suspensión vigente y `changedPasswordAt`.
- `restrictTo('admin')` para endpoints de administración.
- `requireVerifiedEmail` para interacción social.
- `requireCompleteProfile` para match, disponibilidad, postulaciones e invitaciones.
- Ownership obligatorio en matches, invitaciones, postulaciones y feedback.
- Reset de contraseña: token random, hash SHA-256, vence en 1 hora, un solo uso.
- Verificación de email: token random, hash SHA-256, vence en 24 horas.
- hCaptcha en registro.
- Contraseñas de 10 a 128 caracteres.
- Rate limits por IP, por credencial y por usuario autenticado.
- CORS solo con `https://duolan.online` y `https://www.duolan.online` en producción.
- No usar `dangerouslySetInnerHTML` ni equivalentes con contenido de usuario.
- No exponer secretos en respuestas, logs ni bundle.

## 10. Base de datos y migraciones

- Sequelize con `underscored: true`, `timestamps: true`, pool y retry.
- En `NODE_ENV=test` se usa `TEST_DB_URI`; nunca la base de desarrollo o producción.
- Umzug con migraciones SQL crudas y numeradas.
- PK `${tabla}_id` con `gen_random_uuid()`. Excepción: `errors` y `metrics_events` usan `BIGSERIAL`.
- `created_at` y `updated_at` en entidades, salvo tablas inmutables.
- Transacciones con `SELECT ... FOR UPDATE` en like mutuo, aceptar invitación y aceptar postulación.
- Índices únicos y parciales para evitar carreras.
- `rank_index` persistido e indexado.
- Arrays PostgreSQL (`TEXT[]`) y `JSONB` donde corresponda.
- Seeds idempotentes.
- No se editan migraciones ya aplicadas en producción; se agrega una nueva.
- La migración de LAN debe permitir `server IN ('LAS', 'LAN')` y dejar `LAN` como valor operativo.

## 11. API

- Prefijo `/api/v1`.
- Respuesta exitosa: `{ "status": "success", ... }`.
- Respuesta de error: `{ "status": "fail" | "error", "message": "..." }`.
- IDs UUID.
- Fechas ISO 8601 UTC.
- Listados con `limit` (máximo 50).
- Nada de datos sensibles en respuestas públicas.
- Endpoints idempotentes donde el negocio lo permita.
- El contrato está en `docs/API.md`.
- La API debe responder `Duo LAN API v1` en la raíz.

## 12. Realtime y push

- SSE con ticket efímero en memoria (60 segundos), no JWT en query.
- Máximo 5 conexiones SSE por usuario y 1.000 globales.
- Heartbeat cada 25 segundos.
- Headers: `text/event-stream`, `no-cache`, `no-transform`, `X-Accel-Buffering: no`.
- No se usa compresión en la ruta SSE.
- Se persiste la notificación antes de emitir el evento y antes de enviar push.
- Si el cliente estaba desconectado, recupera por API.
- Fallback a polling cada 20 segundos si EventSource falla dos veces.
- SSE y rate limit en memoria implican una sola instancia de API.
- Render free puede dormir y cortar SSE: es una limitación conocida de la beta.
- Push con VAPID, permiso pedido solo con gesto explícito, poda de suscripciones 404/410 y payload menor a 4 KB.
- El service worker solo gestiona push y click; no cachea respuestas autenticadas.
- En Angular, usar `NgZone` para actualizar signals desde `EventSource`.

## 13. Frontend Angular: reglas críticas

1. Ningún componente global montado en `AppComponent` puede llamar endpoints autenticados sin token. Todo servicio que haga fetch debe chequear la sesión y no llamar a la API si no hay token.
2. Los guards deben ser funcionales y no condicionales: si falta usuario, redirigir; no montar componentes protegidos sin sesión.
3. El interceptor 401 debe limpiar token y redirigir a `/login` solo si no se está ya en una ruta pública de auth. Nunca redirigir en bucle.
4. Los endpoints de auth (`/auth/login`, `/auth/register`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`) no disparan redirect.
5. Los endpoints protegidos devuelven 401 sin token; nunca 200 vacío ni redirect del servidor.
6. Toda request protegida debe asumir 401 y manejarlo sin depender de que el usuario esté logueado.
7. `authGuard`, `adminGuard` y `profileCompletedGuard`. Los admins usan `AdminShell` y son redirigidos a `/admin` desde rutas de jugador.
8. `ErrorHandler` global de Angular + pantalla de error para evitar pantallas blancas.
9. Fechas y countdowns con `Intl` y zona `America/Mexico_City`; horarios de disponibilidad según país.
10. Optimistic UI en likes e invitaciones, con rollback en error.
11. No usar `any`. DTOs tipados y servicios por módulo.
12. No hacer `HttpClient` directo en componentes. Los componentes consumen servicios.
13. Usar `ChangeDetectionStrategy.OnPush`, signals y `takeUntilDestroyed`.
14. No duplicar enums: reutilizar `packages/shared` o declarar tipos derivados. No importar Zod al bundle del frontend.
15. No cachear API autenticada en el service worker.
16. No usar Angular Material por defecto: el diseño es Tailwind y componentes propios.
17. No usar NgRx en la primera versión.
18. No usar SSR salvo decisión posterior. La landing puede prerenderizarse más adelante.
19. La interfaz debe ser bilingüe ES/EN. Todo texto visible nuevo debe pasar por `I18nService` y existir en ambos idiomas.
20. Español es el idioma por defecto. La elección se persiste en `localStorage` (`duolan_language`) y el botón de cambio está disponible en la app y en las pantallas públicas.

## 14. Estructura Angular

```text
apps/web/src/app/
├─ core/
│  ├─ api/            # servicios HTTP y DTOs
│  ├─ auth/           # sesión, tokens, guards
│  ├─ interceptors/   # JWT y 401
│  ├─ i18n/           # ES/EN, persistencia y document.lang
│  ├─ realtime/       # SSE y polling
│  └─ config/         # environment, app config
├─ shared/
│  ├─ ui/             # botones, cards, dialogs, inputs, toasts
│  ├─ icons/          # RankIcon, RoleIcon, BetaBadge
│  └─ layout/         # AppShell, AuthShell, AdminShell
└─ features/
   ├─ public/
   ├─ auth/
   ├─ onboarding/
   ├─ home/
   ├─ match/
   ├─ availability/
   ├─ duo-posts/
   ├─ aram/
   ├─ invites/
   ├─ matches/
   ├─ notifications/
   ├─ profile/
   ├─ username-request/
   └─ admin/
```

- Rutas lazy por feature.
- Un servicio por módulo API.
- DTOs en `core/api/models`.
- Nada de lógica de negocio duplicada en componentes.
- Tests de guards, interceptor, auth, SSE y formularios críticos.

## 15. Paridad funcional obligatoria

El frontend Angular debe replicar todas las rutas actuales de Duo LAS:

Público:

- `/`
- `/como-funciona`
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/cuenta-eliminada`
- `/terminos`
- `/privacidad`
- `/aviso-riot`

Jugador:

- `/onboarding`
- `/inicio`
- `/match`
- `/aram`
- `/matches`
- `/disponible`
- `/invitaciones`
- `/busco-1`
- `/notificaciones`
- `/perfil`
- `/solicitud-username`

Admin:

- `/admin`
- `/admin/usuarios`
- `/admin/usuarios/:id`
- `/admin/reportes`
- `/admin/metrics`

Además: 404, error boundary, toasts, skeletons, estados vacíos, responsive mobile-first, PWA, push y SSE.

## 16. Tests

- Backend: Vitest + Supertest, `NODE_ENV=test`, `fileParallelism: false`, timeout 15 segundos.
- Base de test: `duolan_test`; los tests fallan si no está disponible.
- Migraciones en `beforeAll`.
- Fixtures con sufijo único.
- Tests unitarios para rango, roles, horarios, scores, reputación y Riot ID.
- Tests de integración para endpoints y reglas de negocio.
- Tests específicos de LAN: server, países, timezone, matching y seeds.
- Frontend: tests de servicios, guards, interceptores y formularios.
- Sin E2E automatizados en la primera release; smoke manual obligatorio.
- No reducir la cantidad de tests del backend base.

## 17. Git y commits

- Rama de desarrollo: `dev`.
- `main` es producción.
- Husky + lint-staged en pre-commit.
- commitlint en commit-msg.
- Formato: `type(scope): descripción`.
- Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- No se commitean secretos, `.env`, logs, `node_modules` ni `dist`.
- No se hace commit sin que lint y tests pasen.
- Al cerrar cada fase, hacer commit y push a `dev` con lint, tests y build verdes.
- No hacer deploy ni tocar `main` hasta que el usuario lo pida explícitamente.

## 18. Prohibiciones explícitas

- No TypeScript en el backend.
- No Prisma.
- No Redis en el MVP.
- No chat interno.
- No coaching, pagos ni Mercado Pago.
- No Riot API ni RSO en el MVP.
- No assets oficiales de Riot.
- No uploads de imágenes ni avatares.
- No mostrar Riot ID, Discord o WhatsApp antes de una conexión.
- No guardar Riot IDs históricos.
- No exponer emails en perfiles públicos.
- No compartir DB, JWT, VAPID, hCaptcha ni Resend con Duo LAS.
- No hardcodear IDs de usuarios, admins ni owners.
- No borrar datos físicamente salvo entidades efímeras permitidas.
- No cambiar reglas de producto sin actualizar `task2.md` y `docs/DECISIONS.md`.
- No desplegar con secretos de desarrollo.
- No usar la DB de Duo LAS, ni siquiera para leer.

## 19. Definition of Done

Una tarea está terminada cuando:

- Cumple las reglas de este archivo.
- La documentación afectada está actualizada.
- `npm run lint` pasa.
- `npm test` pasa.
- `npm run build` pasa.
- Si toca auth, interceptores o componentes globales, se completó el smoke manual.
- Si toca DB, la migración sube y baja correctamente.
- Si toca UI, funciona en mobile y desktop.
- No se agregaron secretos ni datos personales.
- `task2.md` refleja el estado real.
- No se rompió ninguna ruta de la paridad funcional.

## 20. Comandos previstos

```bash
npm run docker:up        # PostgreSQL local
npm run docker:down
npm run dev              # API
npm run dev:web          # Angular
npm test                 # Vitest + Supertest
npm run lint
npm run format
npm run build
npm run seed             # datos de desarrollo
npm run seed:admin       # admin desde variables de entorno
```

## 21. Deploy

- Web: Vercel, `duolan.online` y `www.duolan.online`.
- API: Render, `api.duolan.online`.
- DB: Neon, exclusiva de DuoLAN.
- DNS: Hostinger.
- Email: Resend con dominio `duolan.online`.
- Captcha: hCaptcha con site key de `duolan.online`.
- Push: VAPID nuevo.
- JWT: secreto nuevo.
- `ADMIN_EMAIL`: mismo email que Duo LAS, solo en Render.
- `ADMIN_PASSWORD`: nuevo, solo durante el seed, luego se elimina.
- Render free es aceptable para beta, pero puede dormir y cortar SSE.
- Producción usa `CORS_ORIGIN=https://duolan.online,https://www.duolan.online` y `APP_URL=https://duolan.online`.
- No usar `localhost` en CORS de producción.
- No usar wildcard en CORS.
- Actualizar CSP para `https://api.duolan.online` y hCaptcha.
- Verificar SSL, healthcheck, emails, captcha, push y legal antes de abrir el registro.

## 22. Aviso legal

DuoLAN es un proyecto independiente. No está afiliado, avalado, patrocinado ni asociado oficialmente con Riot Games. Riot Games y League of Legends son marcas de Riot Games, Inc. El aviso completo exigido por Riot debe mostrarse en el footer y en `/aviso-riot`.
