import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PokemonListComponent } from './features/pokemon/components/pokemon-list/pokemon-list';
import { Header } from './core/components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PokemonListComponent, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('KevinMahechaPokeApi');
}
