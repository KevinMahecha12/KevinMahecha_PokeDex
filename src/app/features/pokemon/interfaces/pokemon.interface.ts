export interface PokemonListResponse {
    count:    number;
    next:     string | null;
    previous: string | null;
    results:  PokemonEntry[];
}

export interface PokemonEntry {
    id: number;
    name: string;
    url:  string;
    image?: string;
    types?: string[];  
    height?: number;    
    weight?: number;
    moves?: string[];
}

export interface MoveDetail {
  name: string;
  power: number | null;
  accuracy: number | null;
  type: string;
  pp: number;
  damage_class: string;
}