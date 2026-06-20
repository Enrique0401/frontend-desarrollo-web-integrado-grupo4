import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaMedico } from './pantalla-medico';

describe('PantallaMedico', () => {
  let component: PantallaMedico;
  let fixture: ComponentFixture<PantallaMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
