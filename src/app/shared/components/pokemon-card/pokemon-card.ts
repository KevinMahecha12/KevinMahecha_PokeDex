import { Component, input, signal, effect } from '@angular/core';
import { PokemonEntry } from '../../../features/pokemon/interfaces/pokemon.interface';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './pokemon-card.html',
})
export class PokemonCard {
  pokemonData = input.required<PokemonEntry>();
  currentImage = signal<string>('');
  private retryCount = 0;
  readonly placeholder = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

  constructor() {
    effect(() => {
      this.retryCount = 0;
      this.currentImage.set(this.pokemonData().image!);
    }, { allowSignalWrites: true });
  }

  getTypeIcon(typeName: string): string {
    const capitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1);
    return `assets/pokemon-types-icons/${capitalized} type.png`;
  }

  get formattedWeight(): string {
    return (this.pokemonData().weight! / 10).toFixed(1) + ' kg';
  }

  get formattedHeight(): string {
    return (this.pokemonData().height! / 10).toFixed(1) + ' m';
  }

  handleImageError() {
    this.retryCount++;
    const id = this.pokemonData().id;
    if (this.retryCount === 1) {
      this.currentImage.set(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
    } else {
      this.currentImage.set(this.placeholder);
    }
  }
}