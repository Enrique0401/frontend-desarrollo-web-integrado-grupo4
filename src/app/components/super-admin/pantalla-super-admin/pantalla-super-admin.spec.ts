import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaSuperAdmin } from './pantalla-super-admin';

describe('PantallaSuperAdmin', () => {
  let component: PantallaSuperAdmin;
  let fixture: ComponentFixture<PantallaSuperAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaSuperAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaSuperAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
