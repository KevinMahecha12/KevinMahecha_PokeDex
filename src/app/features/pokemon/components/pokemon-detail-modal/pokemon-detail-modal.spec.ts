import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDetailModal } from './pokemon-detail-modal';

describe('PokemonDetailModal', () => {
  let component: PokemonDetailModal;
  let fixture: ComponentFixture<PokemonDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
