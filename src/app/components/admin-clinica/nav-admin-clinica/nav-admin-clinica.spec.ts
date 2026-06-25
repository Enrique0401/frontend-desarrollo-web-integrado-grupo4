import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavAdminClinica } from './nav-admin-clinica';

describe('NavAdminClinica', () => {
  let component: NavAdminClinica;
  let fixture: ComponentFixture<NavAdminClinica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavAdminClinica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavAdminClinica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
