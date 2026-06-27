import { TestBed } from '@angular/core/testing';

import { HistoriaClinica } from './historia-clinica';

describe('HistoriaClinica', () => {
  let service: HistoriaClinica;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriaClinica);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
