import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMedico } from './nav-medico';

describe('NavMedico', () => {
  let component: NavMedico;
  let fixture: ComponentFixture<NavMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
