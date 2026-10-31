# task2.md — DuoLAN

Tablero vivo del proyecto **DuoLAN**. Se actualiza al empezar y terminar cada tarea. Si algo no está acá, no está planificado.

## Estado actual

- **Fase:** Fases 0, 1, 2, 3 y 4 completadas. Fase 5 funcional completa: disponibilidad, invitaciones, Busco 1, ARAM y admin. Pendiente: card Conectados y pulido de calidad.
- **Repo:** rama `dev` publicada en `origin/dev`; `main` no se tocó todavía.
- **Backend:** copia adaptada de Duo LAS con `GAME_SERVER=LAN`, migración LAN y branding Duo LAN.
- **Frontend:** público, auth, onboarding, perfil, match, matches y notificaciones completos en Angular 21. Incluye disponibilidad, invitaciones, Busco 1, ARAM y admin.
- **Base de datos:** PostgreSQL 16 local para desarrollo y tests. Neon pendiente de deploy.
- **Dominio:** `duolan.online`, DNS en Hostinger.
- **API:** `api.duolan.online`.
- **Marca:** Duo LAN, mismo logo y diseño, reemplazando LAS por LAN.
- **Timezone UI:** `America/Mexico_City`.
- **Jurisdicción legal:** Argentina.
- **Deploy:** pendiente. Render free inicialmente, Vercel y Neon.
- **Última actualización:** 2026-10-30.

## Decisiones cerradas

- [x] Repo completamente nuevo.
- [x] Backend reutilizado desde Duo LAS.
- [x] Frontend nuevo con Angular + TypeScript.
- [x] Deploy completo con paridad funcional, no un MVP recortado.
- [x] Dominio `duolan.online` comprado y DNS en Hostinger.
- [x] API en `api.duolan.online`.
- [x] DB nueva en Neon, sin compartir con Duo LAS.
- [x] Timezone de referencia `America/Mexico_City`.
- [x] Misma marca Duo, cambiando LAS por LAN.
- [x] Jurisdicción Argentina.
- [x] `ADMIN_EMAIL` igual al de Duo LAS, configurado solo en Render.
- [x] Render free inicialmente, asumiendo limitaciones de SSE.
- [x] Sin Riot API/RSO en el MVP.
- [x] Sin multi-región: esta instancia solo atiende LAN.
- [x] Interfaz bilingüe ES/EN con español por defecto y selector persistente.

## Avance Fase 0/1 (2026-10-30)

- Monorepo `duolan` con workspaces `@duolan/api`, `@duolan/web` y `@duolan/shared`.
- Backend copiado sin `.env`, `node_modules`, `dist` ni logs; imports migrados a `@duolan/*`.
- Angular 21 creado con routing, TypeScript estricto, Tailwind 4, Montserrat, environments y proxy.
- `GAME_SERVER=LAN` validado con enum `LAS`/`LAN`; `RIOT_PLATFORM=la1`.
- Migración `019_region_lan` aplicada y verificada down/up en `duolan_test`.
- Países LAN y timezone `America/Mexico_City`; emails en `es-MX`.
- Seeds y fixtures actualizados a Riot IDs `#LAN` y países LAN.
- Branding backend cambiado a Duo LAN y `duolan.online`.
- Tests: 133 de API (126 base + 7 LAN) y 1 de Angular. Lint y build verdes.
- Resuelto: rama `dev` publicada en `origin/dev`; `main` sigue intacta.
- Pendiente de configuración: `OWNER_EMAIL`, `ADMIN_EMAIL` en Render y `ADMIN_PASSWORD`.

## Avance Fase 2 (2026-10-30)

- `AuthService` con signals, persistencia de token/usuario y restauración de sesión.
- Guards funcionales: `authGuard`, `playerGuard`, `adminGuard` y `profileCompletedGuard`.
- Interceptores JWT y 401 sin loops, con exclusión de endpoints y rutas públicas de auth.
- `ApiService` + servicios tipados para perfiles, matching, disponibilidad, invites, Busco 1, ARAM, notificaciones, trust y admin.
- DTOs compartidos derivados de `packages/shared`, sin importar Zod al bundle.
- Manejo de errores con `ApiError`, `ErrorHandler` global, pantalla `/error` y toasts.
- Shells `AppShell`, `AuthShell` y `AdminShell`; rutas lazy y placeholders de paridad.
- UI compartida: botones, inputs, selects, cards, badges, skeletons, dialog, RankIcon, RoleIcon, CountryBadge, PlayerPreviewCard y RiotDisclaimer.
- Login técnico funcional contra la API LAN y redirección por rol/perfil.
- Tests: 25 de Angular (AuthService, guards, interceptores, formulario de login e i18n).
- Idioma ES/EN agregado con selector persistente en la app y en las pantallas públicas.
- Fase 2 cerrada técnicamente; commit y push a `dev` al finalizar.
- Pendiente: SSE service se implementa en Fase 4 junto con notificaciones.

## Avance Fase 3 (2026-10-30)

- Registro con +18, términos, hCaptcha condicional, verificación de email y reenvío.
- Forgot/reset, cuenta programada para eliminación y recuperación de sesión.
- Onboarding de 7 pasos con Reactive Forms tipados, validaciones y persistencia.
- Perfil propio editable, perfil público sin datos de contacto y solicitud de username con estados.
- Landing final, cómo funciona, términos, privacidad y aviso de Riot bilingües.
- Textos legales adaptados a Duo LAN, LAN y jurisdicción Argentina.
- Selector de idioma ES/EN en las pantallas nuevas y traducciones de Fase 3.
- Tests: 35 de Angular (auth, guards, interceptores, i18n, profile form, registro, login y password toggle).
- Smoke E2E manual con Chrome headless: registro, onboarding completo, perfil, perfil público, username y legales en inglés.
- Pendiente de configuración: site key/secret de hCaptcha; mensajes de error del backend siguen en español.

## Avance Fase 4 (2026-10-30)

- `/match` con filtros por cola y rol, candidatos por afinidad y actualización periódica.
- Like optimista con rollback, like mutuo y listado de likes enviados retirables.
- `/matches` con contacto revelado, copiar, archivar, reportar, bloquear y feedback doble ciego.
- `/notificaciones` con no leídas, marcar todas, eliminar y apertura por tipo.
- SSE con ticket efímero, reconexión, fallback a polling cada 20 s y toasts de eventos.
- Badge de candidatos y no leídas en el shell; recordatorio de likes pendientes en Inicio.
- Push con permiso explícito, service worker, PWA y click de push a la ruta correcta.
- Tests: 37 de Angular (incluye SSE).
- Smoke real con Chrome headless: match, matches y notificaciones con SSE en vivo sin errores de consola.

## Ajuste de paridad Fase 4 (2026-10-30)

- Inicio convertido en dashboard: resumen de perfil, contacto copiable, candidatos con like/block, matches y recordatorio descartable.
- Sesión: aviso al recuperar una cuenta programada para eliminación y manejo de 403 por suspensión con logout + redirect a login.
- Landing con carrusel, cards de jugadores de ejemplo, features y CTA final.
- Cómo funciona ampliado: Flex, tres modos, pasos, ARAM, push, privacidad y CTA.
- Shell: iconos en navegación mobile, acceso a invitaciones y eliminación de cuenta desde el menú.
- Horarios: bloques visibles en hora local según país y aviso de offset contra LAN.
- Notificaciones: iconos por tipo en lugar de marcador genérico.
- Notificaciones de match creado traducidas al inglés en lista y toasts.
- Bloquear y archivar usan diálogo propio en vez de `window.confirm`.
- Tests: 41 de Angular; lint y build verdes.
- Smoke visual headless: landing, cómo funciona e inicio autenticado sin errores.
- Pendiente: commit y push de este ajuste.

## Avance Fase 5 - Disponibilidad e invitaciones (2026-10-31)

- `/disponible` con apertura 30/60 min, roles, cola, nota, cierre manual y contador de TTL.
- Lista de jugadores disponibles con filtros, score, reputación y formulario de invitación.
- `/invitaciones` con bandejas recibidas/enviadas, aceptar, rechazar y cancelar.
- Contacto revelado al aceptar y acceso directo a Matches.
- Estados de invitación, vencimiento y acciones con carga.
- Rutas actualizadas desde placeholders a lazy loading real.
- Tests: 41 de Angular; lint y build verdes.
- Pendiente Fase 5: Busco 1, ARAM y Admin.

## Avance Fase 5 - Busco 1 (2026-10-31)

- `/busco-1` con exploración, filtros por cola y rol, y estados vacíos.
- Creación de publicaciones con cola, hasta dos roles, rango mínimo/máximo y nota.
- Postulación con mensaje y estado de la postulación propia.
- Vista "Mis publicaciones" con contadores, postulaciones, aceptar/rechazar y cierre.
- Contacto revelado al aceptar una postulación y acceso a Matches.
- Confirmación propia para cerrar publicaciones.
- Smoke visual y prueba real de crear/cerrar publicación.
- Tests: 41 de Angular; lint y build verdes.
- Pendiente Fase 5: ARAM y Admin.

## Avance Fase 5 - ARAM (2026-10-31)

- `/aram` con tabs Busco grupo y Disponible ahora.
- Publicación de grupo con jugadores presentes, cupos, ventana, micrófono y nota.
- Disponibilidad individual para ARAM.
- Postulaciones, aceptar/rechazar, retirar solicitud y cerrar publicación.
- Conexiones `source='aram'` y notificaciones existentes del backend.
- Confirmación propia para cerrar publicaciones.
- Smoke visual y prueba real de crear/cerrar publicación.
- Tests: 41 de Angular; lint y build verdes.
- Pendiente Fase 5: Admin.

## Avance Fase 5 - Admin (2026-10-31)

- Dashboard admin con métricas operativas reales, últimos likes/matches, conectados ahora y enlaces filtrados.
- `/admin/usuarios` con búsqueda, filtros, paginación y acceso al detalle.
- `/admin/usuarios/:id` con cuenta, perfil, estadísticas, reportes, sanciones y acciones de moderación.
- Advertencias, suspensiones 7/30/permanente y solicitudes de username.
- `/admin/reportes` con filtros, nota y resolución de reportes.
- `/admin/metrics` con rango de fechas y los cuatro KPIs del MVP.
- Modelos y servicios de admin ajustados a las respuestas reales del backend.
- Smoke visual de las pantallas admin con `demo_admin`.
- Tests: 41 de Angular; lint y build verdes.
- Pendiente: pulido de calidad.

## Leyenda

- `[ ]` pendiente
- `[x]` terminado
- `[~]` en curso
- `[!]` bloqueado

## Fase 0 — Repositorio y scaffold

**Objetivo:** repo nuevo que levanta backend, Angular y PostgreSQL local, con documentación y reglas listas.

- [x] Crear repo `duolan` con historia Git limpia.
- [!] Crear ramas `main` y `dev` (pendiente: no se commitea hasta pedido explícito).
- [x] Configurar Node 22 LTS en `.nvmrc` y `engines`.
- [x] Crear `package.json` raíz con npm workspaces.
- [x] Copiar `apps/api` desde Duo LAS sin `.env`, `node_modules`, `dist` ni logs.
- [x] Copiar `packages/shared` y adaptar constantes a LAN.
- [x] Crear `apps/web` con Angular + TypeScript.
- [x] Renombrar paquetes a `@duolan/api`, `@duolan/web` y `@duolan/shared`.
- [x] Actualizar imports de `@duo-las/*` a `@duolan/*`.
- [x] Configurar ESLint, Prettier, Husky, lint-staged y commitlint.
- [x] Copiar `docker-compose.yml` y crear base `duolan_test`.
- [x] Crear `.env.example` de API y web.
- [x] Copiar y adaptar `README.md`, `docs/` y `agent2.md`.
- [x] Copiar assets propios: iconos, fuentes, illustraciones y favicon.
- [x] Confirmar que no se copiaron secretos, DBs, logs ni `node_modules`.

**DoD:** `npm run docker:up`, API `/health`, Angular dev server, lint y tests base funcionando.

## Fase 1 — Backend LAN

**Objetivo:** backend de DuoLAN funcionando contra una DB nueva y con branding LAN.

### Configuración y dominio

- [x] Agregar `GAME_SERVER=LAN` a `apps/api/src/config/enviroments.js`.
- [x] Validar `GAME_SERVER` con enum `LAS`/`LAN`.
- [x] Mantener `RIOT_PLATFORM=la1` para integración futura.
- [x] Cambiar `SUPPORT_EMAIL` por el correo de soporte de DuoLAN.
- [!] Definir `OWNER_EMAIL` para Resend de DuoLAN (pendiente de cuenta Resend).
- [!] Configurar `ADMIN_EMAIL` con el mismo email de Duo LAS (solo Render, pendiente de deploy).
- [!] Confirmar que `ADMIN_PASSWORD` será nuevo y temporal (pendiente de deploy).

### Lógica LAN

- [x] Reemplazar `server: 'LAS'` por `envs.GAME_SERVER` en `profile.service.js`.
- [x] Reemplazar `server: 'LAS'` por `envs.GAME_SERVER` en `matching.service.js`.
- [x] Actualizar validación de `server` en `profile.model.js`.
- [x] Crear migración `019_region_lan`.
- [x] La migración debe permitir `server IN ('LAS', 'LAN')` y dejar `LAN` operativo.
- [x] Verificar migración down/up en `duolan_test`.
- [x] Actualizar seeds y Riot IDs demo a `#LAN`.
- [x] Actualizar fixtures de tests.
- [x] Verificar que todos los perfiles nuevos se guarden como LAN.
- [x] Verificar que matching no cruce perfiles LAS si alguna vez existieran.

### Países y timezone

- [x] Reemplazar `COUNTRIES` por la lista de países de LAN.
- [x] Reemplazar `COUNTRY_TIMEZONES` por los timezones de LAN.
- [x] Cambiar `TIMEZONE` a `America/Mexico_City`.
- [x] Revisar cálculos de bloques horarios y offsets por país.
- [x] Revisar formato de fechas en notificaciones, feedback, invitaciones y admin.
- [x] Agregar tests de países, timezone y horarios.

### Branding backend

- [x] Cambiar `Duo LAS` por `Duo LAN` en respuestas de API.
- [x] Cambiar `duolas.online` por `duolan.online`.
- [x] Cambiar `deleted.duolas.invalid` por `deleted.duolan.invalid`.
- [x] Actualizar emails de verificación, reset y suspensión.
- [x] Actualizar subject, textos, footer y reply-to.
- [x] Actualizar aviso de Riot en emails si aplica.
- [x] Revisar que no quede ninguna referencia visible a LAS.

### Tests backend

- [x] Ejecutar `npm test` con `TEST_DB_URI` de `duolan_test`.
- [x] Mantener o superar los 126 tests base.
- [x] Agregar tests de:
  - [x] perfil LAN.
  - [x] matching LAN.
  - [x] migración de server.
  - [x] países LAN.
  - [x] timezone `America/Mexico_City`.
  - [x] seeds LAN.
- [x] `npm run lint` verde.
- [x] `npm run build` verde.

### Deploy temprano de API

- [!] Crear proyecto en Neon.
- [!] Crear servicio en Render.
- [!] Configurar Node 22.
- [!] Configurar build `npm ci`.
- [!] Configurar start `npm run start -w @duolan/api`.
- [!] Cargar envs de producción.
- [!] Agregar custom domain `api.duolan.online`.
- [!] Verificar `/health` con `database: connected`.
- [!] Verificar migraciones aplicadas.
- [!] Correr `npm run seed:admin -w @duolan/api`.
- [!] Verificar login del admin.
- [!] Eliminar `ADMIN_PASSWORD` de Render después del seed.
- [!] Confirmar CORS cuando la web esté deployada.

**DoD:** API LAN productiva, DB nueva, migraciones aplicadas, admin creado y tests verdes.

## Fase 2 — Base Angular

**Objetivo:** aplicación Angular con arquitectura, sesión, HTTP, guards y componentes compartidos.

### Scaffold

- [x] Crear Angular app con routing.
- [x] Configurar TypeScript estricto.
- [x] Configurar Tailwind CSS 4 con tokens de Duo LAN.
- [x] Configurar Montserrat.
- [x] Configurar `provideRouter` con lazy loading.
- [x] Configurar `provideHttpClient(withInterceptors([...]))`.
- [x] Configurar `ErrorHandler` global.
- [x] Configurar environments de desarrollo y producción.
- [x] Configurar proxy local hacia la API.

### Core

- [x] Crear `AuthService` con signals.
- [x] Persistir token y usuario en `localStorage`.
- [x] Crear `authGuard`.
- [x] Crear `adminGuard`.
- [x] Crear `profileCompletedGuard`.
- [x] Crear interceptor JWT.
- [x] Crear interceptor 401 sin loops.
- [x] Excluir endpoints de auth del redirect.
- [x] Crear `ApiService` base y servicios por módulo.
- [x] Crear DTOs tipados para auth, perfiles, matching, disponibilidad, posts, ARAM, invites, notificaciones, trust y admin.
- [x] Crear manejo de errores 422/401/403/409/429.
- [x] Crear sistema de toasts.
- [x] Crear `ErrorBoundary` o pantalla global de error.

### Shared UI

- [x] Botones, inputs, selects, cards, badges y skeletons.
- [x] `AppShell`.
- [x] `AuthShell`.
- [x] `AdminShell`.
- [x] `BetaBadge`.
- [x] `RankIcon`.
- [x] `RoleIcon`.
- [x] `CountryBadge`.
- [x] `PlayerPreviewCard`.
- [x] Dialogs de confirmación.
- [x] `RiotDisclaimer`.

### Tests

- [x] Tests de AuthService.
- [x] Tests de guards.
- [x] Tests de interceptores.
- [~] Tests de SSE service (se implementa en Fase 4 con notificaciones).
- [x] Tests de formularios críticos.

**DoD:** shell Angular navegable, login técnico, guards e interceptores probados, diseño base funcionando en mobile y desktop.

## Fase 3 — Público, auth y onboarding

**Objetivo:** flujo de entrada completo.

### Rutas públicas

- [x] Landing `/`.
- [x] Cómo funciona `/como-funciona`.
- [x] Login `/login`.
- [x] Registro `/register`.
- [x] Verificación `/verify-email`.
- [x] Forgot `/forgot-password`.
- [x] Reset `/reset-password`.
- [x] Cuenta eliminada `/cuenta-eliminada`.
- [x] Términos `/terminos`.
- [x] Privacidad `/privacidad`.
- [x] Aviso Riot `/aviso-riot`.
- [x] 404.

### Auth

- [x] Registro con +18, términos y hCaptcha (site key pendiente de configurar en producción).
- [x] Verificación por email.
- [x] Login con email o username.
- [x] Mostrar/ocultar contraseña en login, registro, reset y eliminación de cuenta.
- [x] Logout.
- [x] Forgot/reset.
- [x] Manejo de suspensión.
- [x] Manejo de cuenta pendiente de eliminación.
- [x] Redirect de admin a `/admin`.
- [x] Redirect de usuario logueado desde landing.

### Onboarding

- [x] Paso Riot ID.
- [x] Paso roles.
- [x] Paso rango Solo/Dúo y Flex.
- [x] Paso horarios.
- [x] Paso estilo e idiomas.
- [x] Paso contacto opcional.
- [x] Paso resumen.
- [x] Reactive Forms tipados.
- [x] Validaciones equivalentes a Zod.
- [x] Manejo de país y timezone LAN.
- [x] Persistencia de perfil.
- [x] Redirección a `/inicio` al completar.

### Perfil y username

- [x] Perfil propio `/perfil`.
- [x] Edición de Riot ID, país, roles, rangos, horarios, contacto y bio.
- [x] Perfil público `/perfil/:id`.
- [x] Solicitud de cambio de username `/solicitud-username`.
- [x] Estados pendiente, aprobada y rechazada.

### Legal

- [x] Copiar textos legales.
- [x] Reemplazar LAS por LAN.
- [x] Mantener jurisdicción Argentina.
- [x] Actualizar disclaimer de Riot.
- [x] Actualizar emails de soporte.
- [x] Verificar URLs directas.

### Idioma

- [x] Infraestructura ES/EN con `I18nService` y persistencia en `duolan_language`.
- [x] Selector de idioma en app, landing, auth, onboarding y admin.
- [x] Traducir las pantallas existentes de Fase 2.
- [x] Traducir todas las pantallas nuevas de Fase 3.
- [ ] Traducir mensajes de error del backend o mapearlos en el frontend.

**DoD:** registro, verificación, login, onboarding y perfil funcionando contra la API LAN.

## Fase 4 — Match y notificaciones

**Objetivo:** núcleo social completo.

### Inicio y match

- [x] `/inicio`.
- [x] `/match`.
- [x] Candidatos por afinidad.
- [x] Filtros por cola, rol y rango.
- [x] Like y like mutuo.
- [x] Optimistic UI con rollback.
- [x] Badge de candidatos.
- [x] Actualización periódica de candidatos.
- [x] Banner de likes pendientes.
- [x] Recordatorio de match.
- [x] Estado sin candidatos.

### Matches

- [x] `/matches`.
- [x] Contacto revelado solo después de conexión.
- [x] Riot ID, Discord y WhatsApp.
- [x] Copiar contacto.
- [x] Archivar/reactivar.
- [x] Feedback doble ciego.
- [x] Reputación.
- [x] Reportar.
- [x] Bloquear.
- [x] Auto-bloqueo al reportar.

### Notificaciones

- [x] `/notificaciones`.
- [x] Lista, no leídas y marcar todas.
- [x] Eliminar notificación.
- [x] SSE en vivo.
- [x] Fallback a polling cada 20 segundos.
- [x] Indicador de conexión.
- [x] Toasts en eventos.
- [x] Push con permiso explícito.
- [x] PWA instalable.
- [x] Click de push abre la ruta correcta.

**DoD:** match, matches, feedback, reportes, bloqueos, SSE y push funcionando.

## Fase 5 — Paridad completa

**Objetivo:** replicar todas las funcionalidades actuales de Duo LAS.

### Disponibilidad

- [x] `/disponible`.
- [x] Abrir disponibilidad 30/60 minutos.
- [x] Elegir roles y cola.
- [x] TTL y cierre automático.
- [x] Lista de disponibles.
- [x] Invitar.
- [x] Filtros.
- [ ] Estado vencido.

### Invitaciones

- [x] `/invitaciones`.
- [x] Recibidas y enviadas.
- [x] Aceptar, rechazar y cancelar.
- [x] Vencimiento a 10 minutos.
- [x] Crear conexión al aceptar.
- [x] Contacto revelado.
- [x] Notificaciones.

### Busco 1

- [x] `/busco-1`.
- [x] Crear publicación.
- [x] Filtros.
- [x] Postularse.
- [x] Aceptar/rechazar postulación.
- [x] Cerrar publicación.
- [ ] Límites de posts y postulaciones.
- [x] Notificaciones.

### ARAM

- [x] `/aram`.
- [x] Publicar grupo.
- [x] Disponibilidad individual.
- [x] Postulaciones.
- [x] Aceptar postulación.
- [x] Conexión `source='aram'`.
- [x] Notificaciones y push.
- [x] Métricas ARAM.

### Admin

- [x] `/admin`.
- [x] `/admin/usuarios`.
- [x] `/admin/usuarios/:id`.
- [x] `/admin/reportes`.
- [x] `/admin/metrics`.
- [x] Búsqueda y filtros.
- [x] Advertencias.
- [x] Suspensiones.
- [x] Resolución de reportes.
- [x] Solicitudes de username.
- [x] Métricas.
- [x] Card “Conectados ahora” con SSE activo y auto-refresh cada 30 s.

### Calidad

- [ ] Estados vacíos.
- [ ] Skeletons.
- [ ] Errores de red.
- [ ] Responsive mobile-first.
- [ ] Desktop.
- [ ] Accesibilidad básica.
- [ ] Fechas en `America/Mexico_City`.
- [ ] Copy sin referencias a LAS.

**DoD:** paridad funcional completa con Duo LAS, sin rutas faltantes.

## Fase 6 — Frontend production

**Objetivo:** web Angular deployada y conectada a la API real.

- [ ] Configurar build de producción.
- [ ] Configurar `API_URL=https://api.duolan.online/api`.
- [ ] Configurar `HCAPTCHA_SITE_KEY`.
- [ ] Configurar `vercel.json`.
- [ ] Rewrite SPA a `index.html`.
- [ ] CSP con `connect-src https://api.duolan.online`.
- [ ] Headers de seguridad.
- [ ] Actualizar `index.html`:
  - [ ] título.
  - [ ] descripción.
  - [ ] canonical.
  - [ ] OG.
  - [ ] Twitter Cards.
- [ ] Actualizar `manifest.json`.
- [ ] Actualizar iconos.
- [ ] Crear `og-image.png` de DuoLAN.
- [ ] Verificar mobile y desktop.
- [ ] Verificar que no haya referencias a `duolas.online` ni `Duo LAS`.
- [ ] Deploy en Vercel.
- [ ] Configurar `duolan.online` y `www.duolan.online`.
- [ ] Verificar SSL.

## Fase 7 — Infra, servicios y DNS

**Objetivo:** todos los servicios externos apuntando a DuoLAN.

### Hostinger DNS

- [ ] Configurar `@` hacia Vercel.
- [ ] Configurar `www` hacia Vercel.
- [ ] Configurar `api` hacia Render.
- [ ] Configurar registros de Resend:
  - [ ] SPF.
  - [ ] DKIM.
  - [ ] DMARC recomendado.
- [ ] Esperar propagación.
- [ ] Verificar SSL de web y API.

### Servicios

- [ ] Crear/verificar dominio en Resend.
- [ ] Configurar `OWNER_EMAIL` de DuoLAN.
- [ ] Configurar `SUPPORT_EMAIL` de DuoLAN.
- [ ] Probar emails de verificación, reset y suspensión.
- [ ] Crear site key y secret de hCaptcha para `duolan.online`.
- [ ] Generar VAPID nuevo.
- [ ] Cargar VAPID en Render.
- [ ] Cargar variables de Angular en Vercel.
- [ ] Confirmar `CORS_ORIGIN` con ambos dominios.
- [ ] Confirmar `APP_URL=https://duolan.online`.
- [ ] Confirmar que no hay secretos en el repo.

### Render

- [ ] Confirmar `NODE_ENV=production`.
- [ ] Confirmar `GAME_SERVER=LAN`.
- [ ] Confirmar `DB_URI` de Neon.
- [ ] Confirmar `SECRET_JWT_SEED` nuevo.
- [ ] Confirmar `TRUST_PROXY=1`.
- [ ] Confirmar `LOG_LEVEL=info`.
- [ ] Confirmar que `/health` responde.
- [ ] Confirmar que las migraciones corren.
- [ ] Confirmar que el proceso no se reinicia en loop.
- [ ] Documentar limitación de Render free y SSE.

## Fase 8 — Smoke y lanzamiento

- [ ] `GET https://api.duolan.online/health` → 200 y DB conectada.
- [ ] Registro con +18 y captcha.
- [ ] Email de verificación recibido.
- [ ] Verificación de email.
- [ ] Login.
- [ ] Onboarding completo.
- [ ] Perfil público sin email, Riot ID, Discord ni WhatsApp.
- [ ] Forgot/reset.
- [x] Match, like y match mutuo.
- [x] Contacto revelado.
- [ ] Disponibilidad.
- [ ] Invitaciones.
- [x] Busco 1.
- [ ] ARAM.
- [ ] Feedback.
- [ ] Reporte y bloqueo.
- [ ] Notificaciones SSE.
- [ ] Fallback a polling.
- [ ] Push con PWA instalada.
- [ ] Admin: usuarios, reportes, sanciones, métricas.
- [ ] 401 sin token sin loops.
- [ ] CORS desde `duolan.online`.
- [ ] Términos, privacidad y aviso de Riot.
- [x] Mobile y desktop.
- [ ] Logs sin secretos.
- [x] Migración down/up verificada.
- [ ] `npm test`, lint y build verdes.
- [ ] `task2.md` actualizado.
- [ ] Release aprobado para `main`.

## Checklist de paridad con Duo LAS

### Páginas

- [ ] Landing.
- [ ] Cómo funciona.
- [ ] Login.
- [ ] Registro.
- [ ] Verificación.
- [ ] Forgot.
- [ ] Reset.
- [ ] Cuenta eliminada.
- [ ] Términos.
- [ ] Privacidad.
- [ ] Aviso Riot.
- [ ] Onboarding.
- [ ] Inicio.
- [x] Match.
- [ ] ARAM.
- [x] Matches.
- [ ] Disponible.
- [ ] Invitaciones.
- [x] Busco 1.
- [x] Notificaciones.
- [ ] Perfil.
- [ ] Solicitud de username.
- [ ] Admin resumen.
- [ ] Admin usuarios.
- [ ] Admin detalle.
- [ ] Admin reportes.
- [ ] Admin métricas.
- [ ] 404.

### Features

- [ ] Auth completo.
- [ ] Perfil completo.
- [x] Matching por afinidad.
- [ ] Likes y match mutuo.
- [ ] Disponibilidad.
- [ ] Invitaciones.
- [x] Busco 1.
- [ ] ARAM.
- [ ] Feedback y reputación.
- [ ] Reportes y bloqueos.
- [x] Notificaciones.
- [ ] SSE y polling.
- [ ] Push y PWA.
- [ ] Cambio de username.
- [ ] Admin y moderación.
- [x] Métricas.
- [ ] Rate limits.
- [ ] Seed de desarrollo.
- [ ] Seed de admin.
- [ ] Legales.

## Pendientes de configuración

- [ ] Confirmar `OWNER_EMAIL` y `SUPPORT_EMAIL` definitivos de DuoLAN.
- [ ] Confirmar que `ADMIN_EMAIL` sea el mismo de Duo LAS.
- [ ] Confirmar acceso a Hostinger para DNS.
- [ ] Confirmar site key de hCaptcha de `duolan.online`.
- [ ] Confirmar cuenta de Resend para verificar el dominio.
- [ ] Confirmar plan free de Render y aceptar limitaciones de SSE.
- [ ] Confirmar que el logo se mantiene igual, solo cambia LAS por LAN.

## Riesgos

- Render free duerme y corta SSE.
- Neon free puede enfriar la DB.
- hCaptcha está atado al dominio; no reutilizar la site key de Duo LAS.
- Resend requiere DNS de `duolan.online`.
- Angular service worker puede cachear versiones viejas; definir estrategia antes de PWA.
- La lista de países y timezones de LAN debe validarse antes de producción.
- El copy rioplatense se mantiene por decisión de producto; revisar si se neutraliza más adelante.
- El deploy completo tiene paridad alta: no estimar menos de 6–8 semanas full-time.

## Definition of Done del proyecto

DuoLAN está listo cuando:

- El backend corre en `api.duolan.online` con DB nueva y `GAME_SERVER=LAN`.
- La web Angular corre en `duolan.online` con paridad funcional completa.
- Todos los servicios externos son propios de DuoLAN.
- No hay referencias visibles a Duo LAS.
- Legal, Riot disclaimer y jurisdicción Argentina están actualizados.
- Tests, lint y build pasan.
- Smoke manual completo aprobado.
- No hay secretos en el repositorio.
- `task2.md` y `agent2.md` reflejan el estado real.
