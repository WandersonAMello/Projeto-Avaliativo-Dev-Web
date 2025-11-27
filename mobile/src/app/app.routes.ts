import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Redireciona raiz para login
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'objetos',
    loadComponent: () => import('./objetos/objetos.page').then( m => m.ObjetosPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then( m => m.CadastroPage)
  },
];