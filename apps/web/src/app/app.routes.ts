import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/pages/landing-page').then((module) => module.LandingPage),
    title: 'Duo LAN - Encontrá tu duo en LAN',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
