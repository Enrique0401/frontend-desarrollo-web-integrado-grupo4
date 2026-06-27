import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtencionTriage } from './atencion-triage';

describe('AtencionTriage', () => {
  let component: AtencionTriage;
  let fixture: ComponentFixture<AtencionTriage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionTriage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtencionTriage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
