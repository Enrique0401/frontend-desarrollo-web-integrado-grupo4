import { TestBed } from '@angular/core/testing';

import { Clinica } from './clinica';

describe('Clinica', () => {
  let service: Clinica;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clinica);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
