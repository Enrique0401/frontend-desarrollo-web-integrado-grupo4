import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPersonal } from './agregar-personal';

describe('AgregarPersonal', () => {
  let component: AgregarPersonal;
  let fixture: ComponentFixture<AgregarPersonal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarPersonal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarPersonal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
