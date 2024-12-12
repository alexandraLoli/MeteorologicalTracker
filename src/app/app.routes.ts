import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { EsriMapComponent } from './pages/esri-map/esri-map.component'; // Asigură-te că MapComponent este creat

export const routes: Routes = [
  {
    path: '', // Ruta implicită redirecționează către login
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login', // Pagina de login
    component: LoginComponent
  },
  {
    path: 'map', // Pagina cu harta
    component: EsriMapComponent
  },
  {
    path: '**', // Orice altă rută redirecționează la login
    redirectTo: '/login'
  }
];
