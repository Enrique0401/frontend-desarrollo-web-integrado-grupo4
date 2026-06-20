import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnLoguinComponent } from './btn-loguin.component';

describe('BtnLoguinComponent', () => {
  let component: BtnLoguinComponent;
  let fixture: ComponentFixture<BtnLoguinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnLoguinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnLoguinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
