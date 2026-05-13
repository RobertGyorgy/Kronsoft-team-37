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
    path: 'transport/bus',
    loadComponent: () => import('./features/transport/pages/bus-menu/bus-menu.component').then((component) => component.BusMenuComponent)
  },
  {
    path: 'transport/bus/program',
    loadComponent: () => import('./features/transport/pages/bus-program/bus-program.component').then((component) => component.BusProgramComponent)
  },
  {
    path: 'transport/bus/search',
    loadComponent: () => import('./features/transport/pages/bus-search/bus-search.component').then((component) => component.BusSearchComponent)
  },
  {
    path: 'parking',
    loadComponent: () => import('./features/parking/pages/parking/parking.component').then((component) => component.ParkingComponent)
  },
  {
    path: 'weekend',
    loadComponent: () => import('./features/weekend/pages/weekend/weekend.component').then((component) => component.WeekendComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./features/weekend/pages/events/events.component').then((component) => component.EventsComponent)
  },
  {
    path: 'report',
    loadComponent: () => import('./features/report/pages/report/report').then((component) => component.ReportComponent)
  },
  {
    path: 'report/form',
    loadComponent: () => import('./features/report/pages/report-form/report-form').then((component) => component.ReportFormComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
