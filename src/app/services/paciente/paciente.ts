import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';
import { Paciente } from '../../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private _pacientes = signal<Paciente[]>([]);
  public pacientes = computed(() => this._pacientes());

  constructor() {
    this._pacientes.set([{ idPaciente: 1, nombre: 'Juan', apellido: 'Pérez', tipoDocumento: 'DNI', numeroDocumento: '12345678', correo: 'juan@email.com', telefono: '987654321', fechaNacimiento: '1990-05-15', genero: 'MASCULINO', clinicaId: 1 }]);
  }

  obtenerPacientes(): Observable<Paciente[]> {
    return of(this._pacientes()).pipe(delay(600));
  }

  guardarPaciente(paciente: Paciente): Observable<Paciente> {
    return of(paciente).pipe(
      delay(600),
      tap(nuevo => this._pacientes.update(actuales => [...actuales, { ...nuevo, idPaciente: Math.random() }]))
    );
  }
}