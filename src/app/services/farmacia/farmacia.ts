import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Medicamento } from '../../models/farmacia.model';

@Injectable({ providedIn: 'root' })
export class FarmaciaService {
  private _medicamentos = signal<Medicamento[]>([]);
  public medicamentos = computed(() => this._medicamentos());

  constructor() {
    this._medicamentos.set([{ idMedicamento: 1, nombreComercial: 'Panadol', nombreGenerico: 'Paracetamol', concentracion: '500mg', presentacion: 'Tableta', viaAdministracion: 'Oral', activo: true }]);
  }

  obtenerMedicamentos(): Observable<Medicamento[]> {
    return of(this._medicamentos()).pipe(delay(300));
  }
}