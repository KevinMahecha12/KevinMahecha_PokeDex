import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PokemonEntry } from '../interfaces/pokemon.interface';

@Injectable({
  providedIn: 'root' 
})
export class PokemonService {
  private _http = inject(HttpClient);
  private _baseUrl = (environment as any).apiUrl;

  language = signal<'es' | 'en'>('es');

  limit = 500;
  offset = signal(0);

  private typeTranslations: any = {
    es: { fire: 'fuego', water: 'agua', grass: 'planta', electric: 'eléctrico', psychic: 'psíquico', ice: 'hielo', dragon: 'dragón', dark: 'siniestro', fairy: 'hada', normal: 'normal', fighting: 'lucha', flying: 'volador', poison: 'veneno', ground: 'tierra', rock: 'roca', bug: 'bicho', ghost: 'fantasma', steel: 'acero' },
    en: { fire: 'fire', water: 'water', grass: 'grass', electric: 'electric', psychic: 'psychic', ice: 'ice', dragon: 'dragon', dark: 'dark', fairy: 'fairy', normal: 'normal', fighting: 'fighting', flying: 'flying', poison: 'poison', ground: 'ground', rock: 'rock', bug: 'bug', ghost: 'ghost', steel: 'steel' }
  };

  getPokemonList(): Observable<any> {
    return this._http.get<any>(`${this._baseUrl}/pokemon?limit=${this.limit}&offset=${this.offset()}`);
  }

  getPokemonSpecies(idOrName: string | number): Observable<any> {
    return this._http.get<any>(`${this._baseUrl}/pokemon-species/${idOrName}`);
  }

  getPokemonByName(name: string): Observable<any> {
    return this._http.get<any>(`${this._baseUrl}/pokemon/${name}`);
  }

  getPokemonByType(type: string): Observable<any> {
    return this._http.get<any>(`${this._baseUrl}/type/${type}`);
  }

  private mapPokemonData(results: any[]): PokemonEntry[] {
    return results.map(p => {
      const rawUrl = p.url || p.pokemon?.url;
      const id = rawUrl.split('/').filter(Boolean).pop();
      return {
        name: p.name || p.pokemon.name,
        id: Number(id),
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        url: rawUrl
      };
    });
  }

  getPokemonListMapped(): Observable<{items: PokemonEntry[], hasNext: boolean}> {
    return this.getPokemonList().pipe(
      map(res => ({
        items: this.mapPokemonData(res.results),
        hasNext: !!res.next
      }))
    );
  }

  getPokemonByTypeMapped(type: string): Observable<PokemonEntry[]> {
    return this.getPokemonByType(type).pipe(
      map(res => this.mapPokemonData(res.pokemon))
    );
  }

  nextPage() {
    this.offset.update(actualOffset => actualOffset + this.limit);
  }

  prevPage() {
    if(this.offset() > 0) {
      this.offset.update(actualOffset => actualOffset - this.limit);
    }
  }

  getDetailedMoves(moveNames: string[]): Observable<any[]> {
    const requests = moveNames.map(name => 
      this._http.get<any>(`${this._baseUrl}/move/${name}`)
    );
    
    return forkJoin(requests).pipe(
      map(responses => responses.map(res => {
        const translation = res.names.find((n: any) => n.language.name === this.language());

        return {
          name: translation ? translation.name : res.name.replace('-', ' '),
          power: res.power || '--',
          accuracy: res.accuracy ? res.accuracy + '%' : '--',
          pp: res.pp,
          type: this.translateType(res.type.name)
        };
      }))
    );
  }

  translateType(typeName: string): string {
    return this.typeTranslations[this.language()][typeName.toLowerCase()] || typeName;
  }
}