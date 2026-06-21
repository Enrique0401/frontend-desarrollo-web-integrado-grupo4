import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaEnfermera } from './pantalla-enfermera';

describe('PantallaEnfermera', () => {
  let component: PantallaEnfermera;
  let fixture: ComponentFixture<PantallaEnfermera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaEnfermera]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaEnfermera);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
