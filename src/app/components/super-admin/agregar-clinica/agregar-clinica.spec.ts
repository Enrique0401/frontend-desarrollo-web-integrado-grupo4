import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarClinica } from './agregar-clinica';

describe('AgregarClinica', () => {
  let component: AgregarClinica;
  let fixture: ComponentFixture<AgregarClinica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarClinica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarClinica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
