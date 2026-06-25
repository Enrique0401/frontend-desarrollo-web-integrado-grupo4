import { TestBed } from '@angular/core/testing';

import { Especialidad } from './especialidad';

describe('Especialidad', () => {
  let service: Especialidad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Especialidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
