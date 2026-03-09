import { Component, inject, OnInit, signal, computed, ViewChild, effect } from '@angular/core';
import { PokemonService } from '../../services/pokemon';
import { PokemonEntry } from '../../interfaces/pokemon.interface';
import { GridComponent } from '../../../../shared/components/grid/grid';
import { PokemonCard } from '../../../../shared/components/pokemon-card/pokemon-card';
import { PokemonTypeFilter } from "../type-filter/type-filter";
import { PokemonDetailModal } from '../pokemon-detail-modal/pokemon-detail-modal';
import { catchError, forkJoin, of } from 'rxjs';
import { LanguageSelectionModal } from '../../../../shared/components/language-selection-modal/language-selection-modal';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [GridComponent, PokemonCard, PokemonTypeFilter, PokemonDetailModal, LanguageSelectionModal],
  templateUrl: './pokemon-list.html'
})
export class PokemonListComponent implements OnInit {
  public _pokemonService = inject(PokemonService);

  @ViewChild('typeFilter') typeFilterComponent!: PokemonTypeFilter;
  @ViewChild(GridComponent) gridComponent!: GridComponent;

  loading = signal(false);
  loadingModal = signal(false); 
  pokemonList = signal<PokemonEntry[]>([]);
  backupList = signal<PokemonEntry[]>([]); 
  filterQuery = signal<string>('');
  emptyPokemonList = signal(false);
  showSpinner = signal(false);
  showLanguageModal = signal(false);

  private _loaderTimeout: any;
  
  constructor() {
      effect(() => {
        const isAnyLoading = this.loading() || this.loadingModal();

        if (isAnyLoading) {
          this._loaderTimeout = setTimeout(() => {
            if (this.loading() || this.loadingModal()) {
              this.showSpinner.set(true);
            }
          }, 500);
        } else {
          clearTimeout(this._loaderTimeout);
          this.showSpinner.set(false);
        }
      }, { allowSignalWrites: true });
  }


  noResultsFoundLabel = computed(() => {
    return this._pokemonService.language() === 'es' 
      ? 'Pokémon NO encontrado en toda la pokédex' 
      : 'Pokémon NOT found in the entire Pokédex';
  });

  selectedPokemon = signal<PokemonEntry | null>(null);

  readonly skeletonItems = Array(20).fill({});
  readonly pageSize = 250;
  batchPointer = signal(0);

  filteredPokemon = computed(() => {
    const query = this.filterQuery().toLowerCase().trim();
    const list = this.pokemonList();
    if (!query) return list;
    return list.filter(p => p.name.toLowerCase().includes(query) || p.id.toString().includes(query));
  });

  pagedPokemon = computed(() => {
    const start = this.batchPointer();
    return this.filteredPokemon().slice(start, start + this.pageSize);
  });

  isFirstPage = computed(() => 
    this._pokemonService.offset() === 0 && this.batchPointer() === 0
  );

  isLastPage = computed(() => 
    this.emptyPokemonList() && (this.batchPointer() + this.pageSize >= this.filteredPokemon().length)
  );

  gridLabels = computed(() => {
    const isEs = this._pokemonService.language() === 'es';
    return {
      prev: isEs ? 'Anterior' : 'Previous',
      next: isEs ? 'Siguiente' : 'Next',
      results: isEs ? 'Resultados' : 'Results',
      viewAll: isEs ? 'Ver todos' : 'View all'
    };
  });

  placeholderLabel = computed(() => {
    return this._pokemonService.language() === 'es' 
      ? 'Busca un Pokémon por nombre o ID...' 
      : 'Search a Pokémon by name or ID...';
  });

  searchButtonLabel = computed(() => {
    return this._pokemonService.language() === 'es' 
      ? 'Búsqueda global' 
      : 'Global search';
  });

  ngOnInit(): void {
    const savedLang = localStorage.getItem('pokedex_lang');
    if (!savedLang) {
    this.showLanguageModal.set(true);
  } else {
    this._pokemonService.language.set(savedLang as 'es' | 'en');
    this.loadPokemonsData();
  }
  }

  handleLanguageSelection(lang: 'es' | 'en') {
    localStorage.setItem('pokedex_lang', lang);
    this._pokemonService.language.set(lang);
    this.showLanguageModal.set(false);
    this.loadPokemonsData();
  }

  openModal(pokemon: PokemonEntry) {
    this.loadingModal.set(true);

    forkJoin({
      detail: this._pokemonService.getPokemonByName(pokemon.id.toString()),
      species: this._pokemonService.getPokemonSpecies(pokemon.id).pipe(
        catchError(() => of(null)) 
      )
    }).subscribe({
      next: ({ detail, species }) => {
        let nameTranslation = null;

        // Solo buscamos traducción si species existe
        if (species && species.names) {
          nameTranslation = species.names.find(
            (n: any) => n.language.name === this._pokemonService.language()
          );
        }
        this.selectedPokemon.set({
          ...pokemon,
          name: nameTranslation ? nameTranslation.name : (detail.name.replace('-', ' ')),
          types: detail.types.map((t: any) => t.type.name),
          height: detail.height,
          weight: detail.weight,
          moves: detail.moves.map((m: any) => m.move.name)
        });
        
        this.loadingModal.set(false);
      },
      error: () => {
        this.loadingModal.set(false);
        console.error("Error crítico al cargar el Pokémon");
      }
    });
  }

  loadPokemonsData(targetPointer: number = 0) {
    this.loading.set(true);
    this._pokemonService.getPokemonListMapped().subscribe({
      next: (res) => {
        this.pokemonList.set(res.items);
        this.batchPointer.set(targetPointer);
        this.emptyPokemonList.set(!res.hasNext);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  handleTypeFilter(type: string) {
    if (type === 'all') {
      this.resetToNormalList();
      return;
    }
    this.loading.set(true);
    this.checkAndSaveBackup();
    this._pokemonService.getPokemonByTypeMapped(type).subscribe({
      next: (items) => {
        this.pokemonList.set(items);
        this.batchPointer.set(0);
        this.loading.set(false);
        this.gridComponent?.scrollToTop();
      },
      error: () => this.loading.set(false)
    });
  }

  handleGlobalSearch(query: string) {
    const term = query.toLowerCase().trim();
    if (!term) return;

    if (this.typeFilterComponent) {
      this.typeFilterComponent.reset();
    }

    const local = this.pokemonList().find(p => p.name.toLowerCase() === term || p.id.toString() === term);
    
    if (local) {
      this.filterQuery.set(term);
      this.batchPointer.set(0);
      this.filterQuery.set('');
    } else {
      this.loading.set(true);
      this.checkAndSaveBackup();

      this._pokemonService.getPokemonByName(term).subscribe({
        next: (pokemon) => {
          this._pokemonService.getPokemonSpecies(pokemon.id).subscribe({
            next: (species) => {
              const nameTranslation = species.names.find(
                (n: any) => n.language.name === this._pokemonService.language()
              );

              this.pokemonList.set([{
                id: pokemon.id,
                name: nameTranslation ? nameTranslation.name : pokemon.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
                url: '',
                types: pokemon.types.map((t: any) => t.type.name),
                height: pokemon.height,
                weight: pokemon.weight,
                moves: pokemon.moves.map((m: any) => m.move.name)
              }]);
              
              this.filterQuery.set('');
              this.batchPointer.set(0);
              this.loading.set(false);
            },
            error: () => this.loading.set(false)
          });
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  private checkAndSaveBackup() {
    if (this.backupList().length === 0) {
      this.backupList.set(this.pokemonList());
    }
  }

  resetToNormalList() {
    this.filterQuery.set('');
    this.batchPointer.set(0);
    if (this.typeFilterComponent) {
      this.typeFilterComponent.reset();
    }
    if (this.backupList().length > 0) {
      this.pokemonList.set(this.backupList());
      this.backupList.set([]);
    }
    this.gridComponent?.scrollToTop();
  }

  handleFilter(query: string) {
    this.filterQuery.set(query);
    this.batchPointer.set(0);
  }

  changePage(direction: 'prev' | 'next') {
    if (direction === 'next') {
      if (this.batchPointer() + this.pageSize < this.pokemonList().length) {
        this.batchPointer.update(val => val + this.pageSize);
      } else {
        this._pokemonService.nextPage();
        this.loadPokemonsData(0);
      }
    } else {
      if (this.batchPointer() > 0) {
        this.batchPointer.update(val => val - this.pageSize);
      } else if (this._pokemonService.offset() > 0) {
        this._pokemonService.prevPage();
        this.loadPokemonsData(this.pageSize); 
      }
    }
    if (this.gridComponent) {
      this.gridComponent.scrollToTop();
    }
  }
}