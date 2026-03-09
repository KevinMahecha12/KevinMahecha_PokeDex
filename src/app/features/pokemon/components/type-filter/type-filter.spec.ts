import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonTypeFilter } from './type-filter';

describe('TypeFilter', () => {
  let component: PokemonTypeFilter;
  let fixture: ComponentFixture<PokemonTypeFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonTypeFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonTypeFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
