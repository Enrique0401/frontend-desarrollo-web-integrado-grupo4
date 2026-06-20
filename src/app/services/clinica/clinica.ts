import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Clinica } from '../../models/clinica.model';

@Injectable({ providedIn: 'root' })
export class ClinicaService {
  private _clinicas = signal<Clinica[]>([]);
  public clinicas = computed(() => this._clinicas());

  constructor() {
    this._clinicas.set([{ idClinica: 1, nombre: 'Clínica Central', ruc: '20123456789', direccion: 'Av. Principal 123', telefono: '044-123456', correo: 'contacto@central.com', estado: 'ACTIVA', planSuscripcion: 'PREMIUM', fechaRegistro: '2026-01-15' }]);
  }

  obtenerClinicas(): Observable<Clinica[]> {
    return of(this._clinicas()).pipe(delay(500));
  }
}