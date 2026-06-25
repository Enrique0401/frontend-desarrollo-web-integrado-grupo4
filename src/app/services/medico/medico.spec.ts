import { TestBed } from '@angular/core/testing';

import { Medico } from './medico';

describe('Medico', () => {
  let service: Medico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Medico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
