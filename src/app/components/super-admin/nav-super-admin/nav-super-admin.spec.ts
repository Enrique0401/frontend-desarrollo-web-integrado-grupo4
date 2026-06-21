import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSuperAdmin } from './nav-super-admin';

describe('NavSuperAdmin', () => {
  let component: NavSuperAdmin;
  let fixture: ComponentFixture<NavSuperAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavSuperAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavSuperAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
