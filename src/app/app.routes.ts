import { Routes } from '@angular/router';
import { ArchivoME13Component } from './components/Pages/archivo-me13/archivo-me13.component';
import { MenuComponent } from './components/Shared/menu-app/menu-app.component';
import { ArchivoME14Component } from './components/Pages/archivo-ef14/archivo-ef14.component';
import { ArchivoDV17Component } from './components/Pages/archivo-dv17/archivo-dv17.component';
import { PrincipalComponent } from './components/Shared/principal/principal.component';
import { ArchivoChcajaComponent } from './components/Pages/archivo-chcaja/archivo-chcaja.component';

export const routes: Routes = [
  { path: 'menu', component: MenuComponent },
  { path: '#', component: MenuComponent },
  { path: 'archivo-me13', component: ArchivoME13Component },  
  { path: 'archivo-ef14', component: ArchivoME14Component },
  { path: 'archivo-dv17', component: ArchivoDV17Component },
  { path: 'archivo-chcaja', component: ArchivoChcajaComponent },
  { path: 'inicio', component: PrincipalComponent },  
];
