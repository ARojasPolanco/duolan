# Duo LAN — Caso de estudio full-stack para Voolkia

Preparado por **Alan Rojas Polanco** para el proceso de **Voolkia**.

Duo LAN es una plataforma full-stack, mobile-first y en producción para que jugadores de League of Legends del servidor LAN encuentren duo, completen grupos de Flex y armen partidas de ARAM. Es la adaptación al servidor LAN de la comunidad de **Duo LAS**, producto que ya funciona en LAS.

- **Demo:** https://duolan.online
- **Repositorio:** https://github.com/ARojasPolanco/duolan
- **Rama de producción:** `main`

## Resumen para Voolkia

Mi experiencia principal es **semi-senior en React, Vite, Next.js y Node.js**. Este proyecto fue construido deliberadamente con **Angular 21 + TypeScript**, un stack distinto al que uso todos los días, para demostrar capacidad de:

- Leer documentación y adaptarme rápido a un framework nuevo.
- Entender una arquitectura full-stack y llevar features de punta a punta.
- Traducir patrones que ya conozco de React al modelo mental de Angular.
- Detectar y resolver problemas reales de build, deploy, workspaces, CORS y CSP.
- Entregar un producto funcionando, no solo una prueba técnica aislada.

No presento Duo LAN como “mi stack principal”, sino como evidencia de adaptabilidad técnica y criterio de ingeniería.

## Qué es Duo LAN

Duo LAN conecta jugadores del servidor LAN según compatibilidad real:

- **Match por afinidad:** rango, roles, horarios, idioma y estilo de juego.
- **Solo/Dúo (SoloQ):** encontrar duo para rankear.
- **Flex:** completar un grupo de cinco.
- **ARAM:** jugar partidas casuales con gente compatible.
- **Disponible ya:** ver quién está conectado y disponible.
- **Busco 1:** publicar y completar un lugar libre.
- **Matches, feedback doble ciego, reputación, reportes y bloqueos.**
- **Notificaciones en tiempo real** por SSE y web push.
- **Panel de administración** para moderación, reportes, usuarios y métricas.

La API está desplegada en Render, la web en Vercel, la base en Neon y los emails, captcha y push usan servicios externos. Es un producto real en beta, no un mockup.

## Mi stack habitual vs. este proyecto

| Área        | Mi stack habitual          | Duo LAN                      |
| ----------- | -------------------------- | ---------------------------- |
| UI          | React + Vite / Next.js     | Angular 21 standalone        |
| Lenguaje    | TypeScript                 | TypeScript estricto          |
| Estilos     | Tailwind CSS               | Tailwind CSS 4               |
| Estado      | Zustand / Context / hooks  | Signals + servicios          |
| HTTP        | axios o wrapper de fetch   | `HttpClient` + interceptores |
| Formularios | React Hook Form + Zod      | Reactive Forms + Zod en API  |
| Routing     | React Router / Next Router | Angular Router + guards      |
| Tiempo real | SSE / WebSocket            | SSE + polling de respaldo    |
| Backend     | Node.js + Express          | Node.js + Express            |
| DB          | PostgreSQL                 | PostgreSQL + Sequelize       |
| Tests       | Vitest / Testing Library   | Vitest + tests de Angular    |

## Cómo traduje patrones de React a Angular

Estas son las comparaciones que usaría para explicar el código en una entrevista:

| Necesidad                 | En este proyecto (Angular)                         | Equivalente en React                         |
| ------------------------- | -------------------------------------------------- | -------------------------------------------- |
| Cliente HTTP central      | `ApiService` con base URL y params tipados         | Instancia de axios o wrapper de `fetch`      |
| Manejo global de errores  | `errorInterceptor` + `ApiError`                    | Interceptor de axios + helper de errores     |
| Rutas protegidas          | `authGuard`, `adminGuard`, `profileCompletedGuard` | `ProtectedRoute`, loaders o middleware       |
| Estado compartido         | Servicios con signals y `computed`                 | Zustand, Context o hooks con estado derivado |
| Ciclo de vida             | `ngOnInit`, `DestroyRef`, `takeUntilDestroyed`     | `useEffect` + cleanup                        |
| Formularios               | Reactive Forms tipados                             | React Hook Form + Zod                        |
| i18n                      | `I18nService` con diccionarios tipados             | `i18next` o contexto de idioma               |
| Realtime                  | `SseService` + store de notificaciones             | `EventSource` + store/hook                   |
| Inyección de dependencias | `inject()` y providers de Angular                  | Context, hooks o composición de módulos      |

## Cómo se consume la API

El consumo está centralizado en `apps/web/src/app/core/api/`:

- `api.service.ts` construye una única base URL y normaliza los query params.
- Cada feature tiene su propio servicio con contratos tipados (`MatchingService`, `TrustService`, `NotificationsService`, etc.).
- Los componentes no llaman `HttpClient` directamente: consumen servicios.
- Los DTOs viven en `core/api/models` y se comparten entre servicios y componentes.
- El token JWT se agrega mediante un interceptor funcional.
- La sesión se restaura antes de montar la app con un `provideAppInitializer`.

El equivalente en React sería una instancia de axios con interceptores y una capa de servicios o hooks por dominio. La idea es la misma: **la UI no conoce los detalles del transporte**.

## Cómo se manejan los errores

El flujo es centralizado:

1. La API devuelve un envelope de error consistente.
2. `ApiError.from()` convierte cualquier error de red, HTTP o excepción en un contrato único.
3. `error.interceptor.ts` decide si corresponde cerrar sesión, redirigir, mostrar un toast o dejar que el componente muestre un mensaje contextual.
4. `toUserMessage()` traduce el error técnico a un mensaje entendible para la persona.

Esto evita repetir lógica de 401, 403, 429 y 500 en cada pantalla. En React lo resolvería con un interceptor de axios y un helper compartido, pero el principio de diseño es equivalente.

## Dificultades principales

### Importaciones y resolución de módulos

Angular standalone usa imports explícitos por componente, `inject()` en lugar de constructores con parámetros y un monorepo con workspaces de npm. Al principio tuve que rastrear el grafo de dependencias entre `apps/web`, `apps/api` y `packages/shared`, entender por qué un símbolo existía en un archivo pero no se resolvía en el build y diferenciar errores de TypeScript de errores del bundler.

El caso más claro fue `@duolan/shared`: localmente funcionaba por el symlink del workspace, pero en Vercel el paquete no estaba declarado como dependencia de `apps/web`. Lo resolví declarando la dependencia explícita y actualizando el lockfile.

### Ciclo de vida de los inputs

En Angular, un `input.required()` no está disponible en el constructor. Lo aprendí corrigiendo el panel de feedback: la carga del detalle tenía que moverse a `ngOnInit`. Es un ejemplo de cómo el framework cambia el orden mental respecto de React, donde una prop ya está disponible al renderizar.

### Formularios y submits nativos

Algunos formularios usaban `(ngSubmit)` sin un `FormGroup`. Sin la directiva de Angular, el navegador hacía el submit nativo y recargaba la página. Lo corregí usando `(submit)` con `preventDefault()` y agregué un test de regresión.

### Build y deploy en un monorepo

Los errores más costosos no fueron de lógica de negocio:

- Husky intentaba ejecutarse en producción sin estar instalado.
- Vercel y Render instalaban desde un workspace distinto al que esperaba la configuración.
- El `outputDirectory` de Vercel no coincidía con la carpeta generada por Angular.
- La CSP bloqueaba un `onload` inline que Angular generaba para el CSS crítico.

Para resolverlos tuve que leer documentación de Angular, Vercel, Render, npm workspaces y CSP, comparar logs, reproducir builds en una copia limpia y validar cada cambio. No fueron errores de “Angular no funciona”: fueron problemas de integración entre herramientas.

### Leer código existente

La API y parte de las convenciones venían de Duo LAS. Tuve que revisar modelos, migraciones, servicios, schemas, tests y documentación para entender qué se podía reutilizar, qué había que adaptar a LAN y qué no debía copiarse.

## Uso de IA

Usé un LLM como par de programación para acelerar:

- Borradores de componentes y pantallas.
- Traducción de patrones entre React y Angular.
- Redacción de documentación.
- Iteración sobre errores de build y configuración.

Pero **todas las fases fueron supervisadas**: revisé el código, ejecuté tests, lint y builds, probé flujos en navegador, verifiqué la API y validé la base de datos. No acepté código generado sin entenderlo o sin una verificación reproducible.

La IA fue una herramienta de velocidad, no un reemplazo del criterio técnico.

## Comentarios para la entrevista

Dejé comentarios estratégicos, no explicaciones línea por línea:

- `apps/web/src/app/core/api/api.service.ts` — cliente HTTP centralizado.
- `apps/web/src/app/core/api/api-error.ts` — contrato único de errores.
- `apps/web/src/app/core/interceptors/error.interceptor.ts` — interceptor global y manejo de 401/403.
- `apps/web/src/app/core/auth/guards.ts` — rutas protegidas.
- `apps/web/src/app/core/notifications/notifications.store.ts` — store con signals, SSE y polling.

Esos son los puntos que usaría para explicar cómo adapté el frontend y cómo se conecta con la API.

## Stack técnico

- **Frontend:** Angular 21, TypeScript estricto, Tailwind CSS 4, signals, Reactive Forms, SSE y PWA/push.
- **Backend:** Node.js, Express, Sequelize, PostgreSQL, Zod, JWT, bcrypt, rate limits y SSE.
- **Infraestructura:** Render para API, Vercel para web, Neon para PostgreSQL, Resend para emails, hCaptcha y VAPID para push.
- **Calidad:** 133 tests de API, 43 tests de Angular, lint, build de producción y smoke manual.

## Correr el proyecto

```bash
npm install
npm run docker:up
cp apps/api/.env.example apps/api/.env
npm run dev
npm run dev:web
```

- Web: http://localhost:4200
- API: http://localhost:3000
- Health: http://localhost:3000/health
- PostgreSQL: localhost:5433

## Tests y build

```bash
npm test
npm run test:web
npm run lint
npm run build
npm run build:api
```

## Documentación técnica

- `task2.md` — plan, fases y estado real del proyecto.
- `docs/ARCHITECTURE.md` — arquitectura, realtime, push y manejo de errores.
- `docs/API.md` — contrato de endpoints.
- `docs/DATA-MODEL.md` — modelo de datos y migraciones.
- `docs/PRODUCTION.md` — variables, servicios y checklist de deploy.
- `docs/DECISIONS.md` — decisiones técnicas y producto.

## Aviso legal

Duo LAN no está afiliado, avalado ni patrocinado por Riot Games. League of Legends y Riot Games son marcas de Riot Games, Inc.
