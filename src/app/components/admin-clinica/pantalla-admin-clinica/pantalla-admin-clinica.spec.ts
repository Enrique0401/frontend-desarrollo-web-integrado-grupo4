import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaAdminClinica } from './pantalla-admin-clinica';

describe('PantallaAdminClinica', () => {
  let component: PantallaAdminClinica;
  let fixture: ComponentFixture<PantallaAdminClinica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaAdminClinica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaAdminClinica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
