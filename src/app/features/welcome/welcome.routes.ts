import { Routes } from '@angular/router';

export const welcomeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/welcome').then((component) => component.WelcomeComponent)
  }
];
