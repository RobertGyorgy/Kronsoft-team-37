import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/welcome/pages/welcome/welcome.component').then((component) => component.WelcomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then((component) => component.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then((component) => component.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then((component) => component.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
