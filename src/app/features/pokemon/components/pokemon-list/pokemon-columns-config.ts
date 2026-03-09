import { ColumnDef } from '@tanstack/angular-table';

export const POKEMON_COLUMNS: ColumnDef<any>[] = [
  {
    header: 'Nº Pokedex',
    accessorKey: 'id',
  },
  {
    header: 'Imagen',
    accessorKey: 'image',

    id: 'image'
  },
  {
    header: 'Nombre',
    accessorKey: 'name',
  }
];