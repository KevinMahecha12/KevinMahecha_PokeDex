import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSelectionModal } from './language-selection-modal';

describe('LanguageSelectionModal', () => {
  let component: LanguageSelectionModal;
  let fixture: ComponentFixture<LanguageSelectionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelectionModal],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
