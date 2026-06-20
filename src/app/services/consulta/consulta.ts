import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';
import { ConsultaMedica } from '../../models/atencion-medica.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private _consultas = signal<ConsultaMedica[]>([]);
  public consultas = computed(() => this._consultas());

  guardarConsulta(consulta: ConsultaMedica): Observable<ConsultaMedica> {
    return of(consulta).pipe(
      delay(700),
      tap(nueva => this._consultas.update(actuales => [...actuales, { ...nueva, idConsultaMedica: Math.random() }]))
    );
  }
}