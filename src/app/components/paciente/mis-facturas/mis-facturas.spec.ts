import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisFacturas } from './mis-facturas';

describe('MisFacturas', () => {
  let component: MisFacturas;
  let fixture: ComponentFixture<MisFacturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisFacturas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisFacturas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
