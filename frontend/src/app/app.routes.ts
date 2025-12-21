import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'session/:sessionId',
    loadComponent: () => import('./components/session/session.component').then(m => m.SessionComponent)
  }
];

