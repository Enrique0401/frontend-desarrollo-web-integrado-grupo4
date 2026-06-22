import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisArchivosClinicos } from './mis-archivos-clinicos';

describe('MisArchivosClinicos', () => {
  let component: MisArchivosClinicos;
  let fixture: ComponentFixture<MisArchivosClinicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisArchivosClinicos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisArchivosClinicos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
