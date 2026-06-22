import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisRecetas } from './mis-recetas';

describe('MisRecetas', () => {
  let component: MisRecetas;
  let fixture: ComponentFixture<MisRecetas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisRecetas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisRecetas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
