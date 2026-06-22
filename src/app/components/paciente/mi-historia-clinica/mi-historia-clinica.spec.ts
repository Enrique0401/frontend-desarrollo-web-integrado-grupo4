import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiHistoriaClinica } from './mi-historia-clinica';

describe('MiHistoriaClinica', () => {
  let component: MiHistoriaClinica;
  let fixture: ComponentFixture<MiHistoriaClinica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiHistoriaClinica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiHistoriaClinica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
