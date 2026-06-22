import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosPaciente } from './datos-paciente';

describe('DatosPaciente', () => {
  let component: DatosPaciente;
  let fixture: ComponentFixture<DatosPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
