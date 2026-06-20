import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Medico } from '../../models/personal-medico.model';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private _medicos = signal<Medico[]>([]);
  public medicos = computed(() => this._medicos());

  constructor() {
    this._medicos.set([{ idMedico: 1, usuarioId: 2, especialidadId: 1, clinicaId: 1, numeroColegiatura: 'CMP-12345', activo: true }]);
  }

  obtenerMedicos(): Observable<Medico[]> {
    return of(this._medicos()).pipe(delay(500));
  }
}