import { Routes } from '@angular/router';// Ajusta la ruta a tu archivo
import { PokemonListComponent } from './features/pokemon/components/pokemon-list/pokemon-list';

export const routes: Routes = [
  {
    path: '',
    component: PokemonListComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];