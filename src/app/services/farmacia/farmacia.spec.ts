import { TestBed } from '@angular/core/testing';

import { Farmacia } from './farmacia';

describe('Farmacia', () => {
  let service: Farmacia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Farmacia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
