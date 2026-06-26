import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCitas } from './gestion-citas';

describe('GestionCitas', () => {
  let component: GestionCitas;
  let fixture: ComponentFixture<GestionCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
