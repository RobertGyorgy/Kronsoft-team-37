import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard').then((component) => component.DashboardComponent)
  }
];
