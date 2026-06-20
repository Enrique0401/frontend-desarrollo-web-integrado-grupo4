import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaRecepcionista } from './pantalla-recepcionista';

describe('PantallaRecepcionista', () => {
  let component: PantallaRecepcionista;
  let fixture: ComponentFixture<PantallaRecepcionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaRecepcionista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaRecepcionista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
