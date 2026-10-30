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
    loadComponent: () =>
      import('./features/auth/pages/register-page').then((module) => module.RegisterPage),
    title: 'Crear cuenta - Duo LAN',
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/pages/verify-email-page').then((module) => module.VerifyEmailPage),
    title: 'Verificar email - Duo LAN',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password-page').then(
        (module) => module.ForgotPasswordPage,
      ),
    title: 'Recuperar contraseña - Duo LAN',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password-page').then(
        (module) => module.ResetPasswordPage,
      ),
    title: 'Nueva contraseña - Duo LAN',
  },
  {
    path: 'cuenta-eliminada',
    loadComponent: () =>
      import('./features/auth/pages/account-deleted-page').then(
        (module) => module.AccountDeletedPage,
      ),
    title: 'Cuenta eliminada - Duo LAN',
  },
  {
    path: 'como-funciona',
    loadComponent: () =>
      import('./features/public/pages/how-it-works-page').then((module) => module.HowItWorksPage),
    title: 'Cómo funciona - Duo LAN',
  },
  {
    path: 'terminos',
    loadComponent: () =>
      import('./features/public/pages/legal-page').then((module) => module.LegalPage),
    data: { doc: 'terms' },
    title: 'Términos - Duo LAN',
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./features/public/pages/legal-page').then((module) => module.LegalPage),
    data: { doc: 'privacy' },
    title: 'Privacidad - Duo LAN',
  },
  {
    path: 'aviso-riot',
    loadComponent: () =>
      import('./features/public/pages/legal-page').then((module) => module.LegalPage),
    data: { doc: 'riot' },
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
        loadComponent: () =>
          import('./features/profile/pages/profile-page').then((module) => module.ProfilePage),
        title: 'Mi perfil - Duo LAN',
      },
      {
        path: 'perfil/:id',
        loadComponent: () =>
          import('./features/profile/pages/public-profile-page').then(
            (module) => module.PublicProfilePage,
          ),
        title: 'Perfil - Duo LAN',
      },
      {
        path: 'solicitud-username',
        loadComponent: () =>
          import('./features/username-request/pages/username-request-page').then(
            (module) => module.UsernameRequestPage,
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
