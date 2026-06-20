import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Cita } from '../../models/atencion-medica.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private _citas = signal<Cita[]>([]);
  public citas = computed(() => this._citas());

  constructor() {
    this._citas.set([{ idCita: 1, pacienteId: 1, medicoId: 1, consultorioId: 1, clinicaId: 1, fechaHora: '2026-06-20T10:00:00', fechaFin: '2026-06-20T10:30:00', motivo: 'Chequeo general', estado: 'PROGRAMADA' }]);
  }

  obtenerCitas(): Observable<Cita[]> {
    return of(this._citas()).pipe(delay(400));
  }
}