import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicosCardComponent } from './medicos-card.component';

describe('MedicosCardComponent', () => {
  let component: MedicosCardComponent;
  let fixture: ComponentFixture<MedicosCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicosCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicosCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
