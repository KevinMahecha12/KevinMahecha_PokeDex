import { Component, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon';

@Component({
  selector: 'app-pokemon-type-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3 px-4 md:px-0 font-pokemon">
      
      <div class="lg:hidden flex items-center justify-center gap-2 mb-1">
        <button 
          (click)="toggleMenu()"
          class="w-full max-w-[280px] flex items-center justify-between p-2 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <span class="text-gray-400 text-[10px] uppercase ml-2">
              {{ pokemonService.language() === 'es' ? 'Tipo:' : 'Type:' }}
            </span>
            
            <div class="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
              @if (selectedType() !== 'all') {
                <div 
                  [style.backgroundColor]="getSelectedColor()"
                  class="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                >
                  <img 
                    [src]="getTypeImagePath(selectedType())" 
                    class="w-3 h-3 object-contain" 
                  />
                </div>
              }
              <span class="text-[10px] font-bold uppercase text-gray-700">
                {{ translateType(selectedType()) }}
              </span>
            </div>
          </div>

          <span class="text-gray-400 text-xs mr-2 transition-transform duration-300" [class.rotate-180]="isMenuOpen()">
            ▼
          </span>
        </button>

        @if (selectedType() !== 'all') {
          <button 
            (click)="selectedType.set('all'); onTypeChange.emit('all'); isMenuOpen.set(false)"
            class="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-all cursor-pointer"
          >
            <span class="text-lg font-bold">×</span>
          </button>
        }
      </div>

      <div 
        [class.hidden]="!isMenuOpen()" 
        class="lg:flex lg:flex-wrap justify-center gap-x-2 gap-y-4 md:gap-4 p-3 bg-white 2xl:rounded-full md:rounded-md border border-gray-100 shadow-xl md:shadow-sm mt-3 md:mt-0 transition-all duration-300 grid grid-cols-4 sm:grid-cols-6"
      >
        @for (type of translatedTypes(); track type.id) {
          <button 
            (click)="toggleType(type.id)"
            class="flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-90 group shrink-0 cursor-pointer"
          >
            <div 
              [style.backgroundColor]="type.color"
              [class.scale-110]="selectedType() === type.id"
              [class.ring-4]="selectedType() === type.id"
              [class.ring-gray-100]="selectedType() === type.id"
              [class.opacity-40]="selectedType() !== 'all' && selectedType() !== type.id"
              class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all overflow-hidden"
            >
              @if (type.id !== 'all') {
                <img 
                  [src]="getTypeImagePath(type.id)" 
                  [alt]="type.label"
                  class="w-6 h-6 md:w-7 md:h-7 object-contain" 
                />
              } @else {
                  <span class="text-white text-[10px] uppercase font-bold">{{ type.label }}</span>
              }
            </div>
            
            <span 
              class="text-[7px] md:text-[9px] font-bold uppercase transition-colors leading-tight text-center max-w-[60px]"
              [style.color]="selectedType() === type.id ? type.color : '#94a3b8'"
            >
              {{ type.label }}
            </span>
          </button>
        }
      </div>
    </div>
  `
})
export class PokemonTypeFilter {
  public pokemonService = inject(PokemonService);
  onTypeChange = output<string>();
  selectedType = signal<string>('all');
  isMenuOpen = signal<boolean>(false);

  private readonly typeBase = [
    { id: 'all', color: '#6366f1' },
    { id: 'normal', color: '#A8A77A' },
    { id: 'fire', color: '#EE8130' },
    { id: 'water', color: '#6390F0' },
    { id: 'electric', color: '#F7D02C' },
    { id: 'grass', color: '#7AC74C' },
    { id: 'ice', color: '#96D9D6' },
    { id: 'fighting', color: '#C22E28' },
    { id: 'poison', color: '#A33EA1' },
    { id: 'ground', color: '#E2BF65' },
    { id: 'flying', color: '#A98FF3' },
    { id: 'psychic', color: '#F95587' },
    { id: 'bug', color: '#A6B91A' },
    { id: 'rock', color: '#B6A136' },
    { id: 'ghost', color: '#735797' },
    { id: 'dragon', color: '#6F35FC' },
    { id: 'dark', color: '#705746' },
    { id: 'steel', color: '#B7B7CE' },
    { id: 'fairy', color: '#D685AD' },
  ];

  translatedTypes = computed(() => {
    return this.typeBase.map(type => ({
      ...type,
      label: this.translateType(type.id)
    }));
  });

  translateType(typeId: string): string {
    if (typeId === 'all') {
      return this.pokemonService.language() === 'es' ? 'Todos' : 'All';
    }
    return this.pokemonService.translateType(typeId);
  }

  getTypeImagePath(typeId: string): string {
    if (!typeId || typeId === 'all') return '';
    const capitalized = typeId.charAt(0).toUpperCase() + typeId.slice(1);
    return `assets/pokemon-types-icons/${capitalized} type.png`;
  }

  getSelectedColor(): string {
    const type = this.typeBase.find(t => t.id === this.selectedType());
    return type ? type.color : '#6366f1';
  }

  toggleMenu() {
    this.isMenuOpen.update(prev => !prev);
  }

  reset() {
    this.selectedType.set('all');
    this.isMenuOpen.set(false);
  }

  toggleType(typeId: string) {
    if (this.selectedType() === typeId || typeId === 'all') {
      this.selectedType.set('all');
      this.onTypeChange.emit('all');
    } else {
      this.selectedType.set(typeId);
      this.onTypeChange.emit(typeId);
    }
    if (window.innerWidth < 768) {
      this.isMenuOpen.set(false);
    }
  }
}