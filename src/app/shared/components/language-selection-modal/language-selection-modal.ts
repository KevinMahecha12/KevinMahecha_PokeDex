import { Component, output } from '@angular/core';

@Component({
  selector: 'app-language-selection-modal',
  standalone: true,
  imports: [],
  templateUrl: './language-selection-modal.html',
})
export class LanguageSelectionModal {
  onSelect = output<'es' | 'en'>(); 

  selectLanguage(lang: 'es' | 'en') {
    this.onSelect.emit(lang);
  }
}