import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clinicas } from './clinicas';

describe('Clinicas', () => {
  let component: Clinicas;
  let fixture: ComponentFixture<Clinicas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clinicas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clinicas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
