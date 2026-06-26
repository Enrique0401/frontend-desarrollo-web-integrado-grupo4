import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmisionPacientes } from './admision-pacientes';

describe('AdmisionPacientes', () => {
  let component: AdmisionPacientes;
  let fixture: ComponentFixture<AdmisionPacientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmisionPacientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmisionPacientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
