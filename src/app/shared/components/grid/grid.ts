import { Component, ContentChild, ElementRef, Input, TemplateRef, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.html',
})
export class GridComponent {
  items = input<any[]>([]);
  
  withSearch = input<boolean>(false);
  withSearchButton = input<boolean>(false);
  withPagination = input<boolean>(false);
  placeholder = input<string>('Buscar...');
  noResultsFoundLabel = input<string>('No se encontraron resultados...');
  labelSearchButton = input<string>('BUSCAR');
  disabledValueNextButton = input<boolean>(false);
  disabledValuePrevButton = input<boolean>(false);

  @Input() labelPrev: string = 'Anterior';
  @Input() labelNext: string = 'Siguiente';
  @Input() labelResults: string = 'Resultados';
  @Input() labelViewAll: string = 'Ver todos';

  onSearch = output<string>();
  onSearchClick = output<string>(); 
  onClear = output<void>();
  onPageChange = output<'prev' | 'next'>();

  searchTerm = signal('');
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchField');
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  public scrollToTop() {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  handleSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.onSearch.emit(value);
    this.scrollToTop();
  }

  clearSearch() {
    this.searchTerm.set('');
    if (this.searchInput()) {
      this.searchInput()!.nativeElement.value = '';
    }
    this.scrollToTop();
    this.onClear.emit();
  }

  triggerSearch() {
    this.onSearchClick.emit(this.searchTerm());
  }

  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
}