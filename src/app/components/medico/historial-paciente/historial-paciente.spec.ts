import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPaciente } from './historial-paciente';

describe('HistorialPaciente', () => {
  let component: HistorialPaciente;
  let fixture: ComponentFixture<HistorialPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
