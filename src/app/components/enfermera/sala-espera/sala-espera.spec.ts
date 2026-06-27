import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaEspera } from './sala-espera';

describe('SalaEspera', () => {
  let component: SalaEspera;
  let fixture: ComponentFixture<SalaEspera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaEspera]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaEspera);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
