import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaPaciente } from './pantalla-paciente';

describe('PantallaPaciente', () => {
  let component: PantallaPaciente;
  let fixture: ComponentFixture<PantallaPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
