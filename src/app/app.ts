import { Component, signal } from '@angular/core';
import { PokemonListComponent } from './features/pokemon/components/pokemon-list/pokemon-list';
import { Header } from './core/components/header/header';
import { Footer } from './core/components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [PokemonListComponent, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('KevinMahechaPokeApi');
}
