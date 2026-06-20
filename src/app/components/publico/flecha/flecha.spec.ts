import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flecha } from './flecha';

describe('Flecha', () => {
  let component: Flecha;
  let fixture: ComponentFixture<Flecha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flecha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Flecha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
