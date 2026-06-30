import { TestBed } from '@angular/core/testing';

import { DetalleReceta } from './detalle-receta';

describe('DetalleReceta', () => {
  let service: DetalleReceta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetalleReceta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
