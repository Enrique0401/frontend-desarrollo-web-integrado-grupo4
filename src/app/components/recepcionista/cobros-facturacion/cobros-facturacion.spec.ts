import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CobrosFacturacion } from './cobros-facturacion';

describe('CobrosFacturacion', () => {
  let component: CobrosFacturacion;
  let fixture: ComponentFixture<CobrosFacturacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CobrosFacturacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CobrosFacturacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
