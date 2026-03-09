import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, Output, EventEmitter } from '@angular/core';
import { createAngularTable, FlexRenderDirective, getCoreRowModel, getPaginationRowModel, ColumnDef } from '@tanstack/angular-table';
import { CommonModule } from '@angular/common';

export type TableAction = [
  label: string, 
  onClick: (row: any) => void, 
  icon: string, 
  bgColor: string, 
  textColor: string
];

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, FlexRenderDirective],
  templateUrl: './reusable-table.html',
  styleUrls: ['./reusable-table.css']
})
export class ReusableTableComponent implements OnInit, OnChanges {

  @Input() isLoading: boolean = false;
  @Input() skeletonActive: boolean = false;
  @Input() data: any[] = [];
  @Input() columns: ColumnDef<any>[] = [];
  @Input() hasPagination: boolean = false;
  @Input() showActions: boolean = false;
  @Input() actions: TableAction[] = [];
  @Input() currentPage: number = 0;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() labelPrev: string = 'Anterior';
  @Input() labelNext: string = 'Siguiente';
  @Input() labelPage: string = 'Página';
  @Input() labelOf: string = 'de';

  @Output() onNextPage = new EventEmitter<void>();
  @Output() onPrevPage = new EventEmitter<void>();

  

  private _dataSignal = signal<any[]>([]);
  private _columnsSignal = signal<ColumnDef<any>[]>([]);

  table = createAngularTable(() => ({
    data: this._dataSignal(),
    columns: this._columnsSignal(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: this.hasPagination ? getPaginationRowModel() : undefined,
  }));

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this._dataSignal.set(this.data);
    }
  }

  get skeletonRows(): number[] {
    return Array(this.pageSize).fill(0);
  }

  ngOnInit(): void {
    const finalColumns = [...this.columns];
    
    if (this.showActions && this.actions.length > 0) {
      // Evitamos duplicar la columna si se dispara el init varias veces
      if (!finalColumns.find(col => col.id === 'actions')) {
        finalColumns.push({
          id: 'actions',
          header: 'Acciones',
          cell: (info) => info.row.original 
        });
      }
    }

    this._dataSignal.set(this.data);
    this._columnsSignal.set(finalColumns);
  }
}