import type { Routes } from '@angular/router';
import { adminGuard, authGuard, playerGuard, profileCompletedGuard } from './core/auth/guards';

const placeholder = (title: string, description: string) => ({
  loadComponent: () =>
    import('./features/shared/pages/placeholder-page').then((module) => module.PlaceholderPage),
  data: { title, description },
});

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/public/pages/landing-page').then((module) => module.LandingPage),
    title: 'Duo LAN - Encontrá tu duo en LAN',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page').then((module) => module.LoginPage),
    title: 'Iniciar sesión - Duo LAN',
  },
  {
    path: 'register',
    ...placeholder(
      'Crear cuenta',
      'El registro con +18, términos y hCaptcha se implementa en la Fase 3.',
    ),
    title: 'Crear cuenta - Duo LAN',
  },
  {
    path: 'verify-email',
    ...placeholder('Verificar email', 'La verificación de email se implementa en la Fase 3.'),
    title: 'Verificar email - Duo LAN',
  },
  {
    path: 'forgot-password',
    ...placeholder('Recuperar contraseña', 'La recuperación se implementa en la Fase 3.'),
    title: 'Recuperar contraseña - Duo LAN',
  },
  {
    path: 'reset-password',
    ...placeholder('Nueva contraseña', 'El reset de contraseña se implementa en la Fase 3.'),
    title: 'Nueva contraseña - Duo LAN',
  },
  {
    path: 'cuenta-eliminada',
    ...placeholder('Cuenta eliminada', 'La baja programada se implementa en la Fase 3.'),
    title: 'Cuenta eliminada - Duo LAN',
  },
  {
    path: 'como-funciona',
    ...placeholder(
      'Cómo funciona',
      'La guía pública de Match, Disponible ya, Busco 1 y ARAM se implementa en la Fase 3.',
    ),
    title: 'Cómo funciona - Duo LAN',
  },
  {
    path: 'terminos',
    ...placeholder('Términos de uso', 'Los términos legales se copian y adaptan en la Fase 3.'),
    title: 'Términos - Duo LAN',
  },
  {
    path: 'privacidad',
    ...placeholder('Política de privacidad', 'La política de privacidad se adapta en la Fase 3.'),
    title: 'Privacidad - Duo LAN',
  },
  {
    path: 'aviso-riot',
    ...placeholder('Aviso de Riot', 'El aviso legal completo de Riot se implementa en la Fase 3.'),
    title: 'Aviso de Riot - Duo LAN',
  },
  {
    path: 'onboarding',
    canActivate: [authGuard, playerGuard],
    loadComponent: () =>
      import('./features/onboarding/pages/onboarding-page').then((module) => module.OnboardingPage),
    title: 'Completar perfil - Duo LAN',
  },
  {
    path: '',
    canActivate: [authGuard, playerGuard],
    loadComponent: () =>
      import('./shared/layout/app-shell.component').then((module) => module.AppShellComponent),
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/home/pages/home-page').then((module) => module.HomePage),
        title: 'Inicio - Duo LAN',
      },
      {
        path: 'match',
        canActivate: [profileCompletedGuard],
        ...placeholder(
          'Match',
          'Candidatos por afinidad, likes y match mutuo llegan en la Fase 4.',
        ),
        title: 'Match - Duo LAN',
      },
      {
        path: 'aram',
        canActivate: [profileCompletedGuard],
        ...placeholder('ARAM', 'La búsqueda de ARAM llega en la Fase 5.'),
        title: 'ARAM - Duo LAN',
      },
      {
        path: 'matches',
        canActivate: [profileCompletedGuard],
        ...placeholder('Matches', 'Las conexiones y el contacto revelado llegan en la Fase 4.'),
        title: 'Matches - Duo LAN',
      },
      {
        path: 'disponible',
        canActivate: [profileCompletedGuard],
        ...placeholder('Disponible ya', 'La disponibilidad inmediata llega en la Fase 5.'),
        title: 'Disponible - Duo LAN',
      },
      {
        path: 'invitaciones',
        canActivate: [profileCompletedGuard],
        ...placeholder('Invitaciones', 'Las invitaciones llegan en la Fase 5.'),
        title: 'Invitaciones - Duo LAN',
      },
      {
        path: 'busco-1',
        canActivate: [profileCompletedGuard],
        ...placeholder('Busco 1', 'Las publicaciones de grupo llegan en la Fase 5.'),
        title: 'Busco 1 - Duo LAN',
      },
      {
        path: 'notificaciones',
        ...placeholder('Notificaciones', 'El centro de notificaciones llega en la Fase 4.'),
        title: 'Notificaciones - Duo LAN',
      },
      {
        path: 'perfil',
        ...placeholder('Mi perfil', 'El perfil propio se implementa en la Fase 3.'),
        title: 'Mi perfil - Duo LAN',
      },
      {
        path: 'perfil/:id',
        ...placeholder('Perfil público', 'El perfil público se implementa en la Fase 3.'),
        title: 'Perfil - Duo LAN',
      },
      {
        path: 'solicitud-username',
        ...placeholder(
          'Solicitud de username',
          'El cambio de username asistido se implementa en la Fase 3.',
        ),
        title: 'Solicitud de username - Duo LAN',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./shared/layout/admin-shell.component').then((module) => module.AdminShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/pages/admin-overview-page').then(
            (module) => module.AdminOverviewPage,
          ),
        title: 'Admin - Duo LAN',
      },
      {
        path: 'usuarios',
        ...placeholder('Usuarios', 'La búsqueda y el detalle de usuarios llegan en la Fase 5.'),
        title: 'Admin usuarios - Duo LAN',
      },
      {
        path: 'usuarios/:id',
        ...placeholder('Detalle de usuario', 'El detalle de usuario llega en la Fase 5.'),
        title: 'Admin usuario - Duo LAN',
      },
      {
        path: 'reportes',
        ...placeholder('Reportes', 'La moderación de reportes llega en la Fase 5.'),
        title: 'Admin reportes - Duo LAN',
      },
      {
        path: 'metrics',
        ...placeholder('Métricas', 'Las métricas de admin llegan en la Fase 5.'),
        title: 'Admin métricas - Duo LAN',
      },
    ],
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./features/errors/pages/error-page').then((module) => module.ErrorPage),
    title: 'Error - Duo LAN',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/pages/not-found-page').then((module) => module.NotFoundPage),
    title: 'No encontrado - Duo LAN',
  },
];
