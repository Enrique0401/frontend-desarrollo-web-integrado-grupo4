import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavegacionGeneralComponent } from './navegacion-general.component';

describe('NavegacionGeneralComponent', () => {
  let component: NavegacionGeneralComponent;
  let fixture: ComponentFixture<NavegacionGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegacionGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavegacionGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
