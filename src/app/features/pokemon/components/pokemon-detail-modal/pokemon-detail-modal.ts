import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonEntry } from '../../interfaces/pokemon.interface';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';
import { PokemonService } from '../../services/pokemon';
import { ColumnDef } from '@tanstack/angular-table';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table';

@Component({
  selector: 'app-pokemon-detail-modal',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent],
  templateUrl: './pokemon-detail-modal.html'
})
export class PokemonDetailModal {
  pokemon = input.required<PokemonEntry>();
  close = output<void>();
  
  private _http = inject(HttpClient);
  public pokemonService = inject(PokemonService);

  evolutions = signal<any[]>([]);
  loadingEvolutions = signal(false);
  showAllMoves = signal(false);
  detailedMoves = signal<any[]>([]);
  loadingMoves = signal(false);
  expectedEvoCount = signal<number>(0);
  currentPage = signal(0);
  currentImage = signal<string>('')
  private retryCount = 0;
  readonly placeholder = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
  pageSize = 10;

  ui = computed(() => {
    const isEs = this.pokemonService.language() === 'es';
    
    const typeTranslations: Record<string, string> = {
      water: 'agua', fire: 'fuego', grass: 'planta', electric: 'eléctrico',
      ice: 'hielo', fighting: 'lucha', poison: 'veneno', ground: 'tierra',
      flying: 'volador', psychic: 'psíquico', bug: 'bicho', rock: 'roca',
      ghost: 'fantasma', dragon: 'dragón', dark: 'siniestro', steel: 'acero',
      fairy: 'hada', normal: 'normal'
    };

    return {
      height: isEs ? 'Altura' : 'Height',
      weight: isEs ? 'Peso' : 'Weight',
      moveStats: isEs ? 'Estadísticas de Movimientos' : 'Move Statistics',
      evoLine: isEs ? 'Línea Evolutiva' : 'Evolution Chain',
      singleStage: isEs ? 'Etapa única de evolución' : 'Single evolution stage',
      prev: isEs ? 'Anterior' : 'Previous',
      next: isEs ? 'Siguiente' : 'Next',
      page: isEs ? 'Página' : 'Page',
      of: isEs ? 'de' : 'of',
      translateType: (type: string) => isEs ? (typeTranslations[type.toLowerCase()] || type) : type
    };
  });

  
  moveColumns = computed<ColumnDef<any>[]>(() => {
    const isEs = this.pokemonService.language() === 'es';
    const isMobile = window.innerWidth < 768;
    
    return [
      { 
        header: isEs ? 'Nombre' : 'Name', 
        accessorKey: 'name',
        size: isMobile ? 160 : 200, 
        minSize: isMobile ? 80 : 150
      },
      { 
        header: isEs ? 'Poder' : 'Power', 
        accessorKey: 'power',
        size: 80 
      },
      { 
        header: isEs ? 'Prec.' : 'Acc.', 
        accessorKey: 'accuracy',
        size: 80 
      },
      { 
        header: 'PP', 
        accessorKey: 'pp',
        size: 60 
      }
    ];
  });

  currentYear: number = new Date().getFullYear();

  movesEffect = effect(() => {
  const pokemon = this.pokemon(); 
  if (pokemon && pokemon.moves && pokemon.moves.length > 0) {
    this.loadMovePage(0); 
  }
}, { allowSignalWrites: true });

  constructor() {
    effect(() => {
      const currentPokemon = this.pokemon();

      if (currentPokemon) {
        this.loadEvolutionChain();
        this.retryCount = 0;
        this.currentImage.set(currentPokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPokemon.id}.png`);
        
        if (this.showAllMoves()) {
          this.loadMovePage(this.currentPage());
        } else {
          this.detailedMoves.set([]);
          this.currentPage.set(0);
        }
      }
    });
  }

  toggleMoves() {
    this.showAllMoves.update(v => !v);
    if (this.showAllMoves() && this.detailedMoves().length === 0) {
      this.loadMovePage(0);
    }
  }

  loadMovePage(page: number) {
    const allMoveNames = this.pokemon().moves || [];
    const start = page * this.pageSize;
    const end = start + this.pageSize;
    const batchNames = allMoveNames.slice(start, end);

    if (batchNames.length > 0) {
      this.loadingMoves.set(true);
      this.detailedMoves.set([]);
      this.pokemonService.getDetailedMoves(batchNames).subscribe({
        next: (data) => {
          this.detailedMoves.set(data);
          this.currentPage.set(page);
          this.loadingMoves.set(false);
        },
        error: () => this.loadingMoves.set(false)
      });
    }
  }

  nextMovePage() {
    this.loadMovePage(this.currentPage() + 1);
  }

  prevMovePage() {
    if (this.currentPage() > 0) {
      this.loadMovePage(this.currentPage() - 1);
    }
  }

  loadEvolutionChain() {
    this.loadingEvolutions.set(true);
    this._http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${this.pokemon().id}/`)
      .pipe(
        switchMap(species => this._http.get<any>(species.evolution_chain.url)),
        switchMap(chainData => {
          const speciesRequests: any[] = [];
          let currData = chainData.chain;
          const basicEvoInfo: any[] = [];

          do {
            const pokemonId = currData.species.url.split('/').filter(Boolean).pop();
            basicEvoInfo.push({
              id: pokemonId,
              minLevel: currData.evolution_details[0]?.min_level
            });
            speciesRequests.push(this.pokemonService.getPokemonSpecies(pokemonId!));
            currData = currData.evolves_to[0];
          } while (!!currData && currData.hasOwnProperty('evolves_to'));
          this.expectedEvoCount.set(basicEvoInfo.length);
          return forkJoin(speciesRequests).pipe(
            map(speciesResponses => {
              return speciesResponses.map((specieRes, index) => {
                const translation = specieRes.names.find((n: any) => n.language.name === this.pokemonService.language());
                return {
                  name: translation ? translation.name : specieRes.name,
                  id: basicEvoInfo[index].id,
                  image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${basicEvoInfo[index].id}.png`,
                  minLevel: basicEvoInfo[index].minLevel
                };
              });
            })
          );
        })
      ).subscribe({
        next: (evos) => {
          this.evolutions.set(evos);
          this.loadingEvolutions.set(false);
        },
        error: () => this.loadingEvolutions.set(false)
      });
  }
  
  getTypeIcon(typeName: string): string {
    const capitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1);
    return `assets/pokemon-types-icons/${capitalized} type.png`;
  }

  handleImageError() {
  this.retryCount++;
  const id = this.pokemon().id;
    if (this.retryCount === 1) {
      // PRIORIDAD 2: Si la img del sprite falló, intentamos el official Artwork
      this.currentImage.set(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
    } else {
      // PRIORIDAD 3: Pokébola de img de emergencia generica...
      this.currentImage.set(this.placeholder);
    }
  }
}