import { Component, inject } from '@angular/core';
import { PokemonService } from '../../../features/pokemon/services/pokemon';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  public pokemonService = inject(PokemonService);

  toggleLanguage() {
    const newLang = this.pokemonService.language() === 'es' ? 'en' : 'es';
    this.pokemonService.language.set(newLang);
  }

}
