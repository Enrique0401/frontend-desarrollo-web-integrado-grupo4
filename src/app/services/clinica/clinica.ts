import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinica } from '../../models/clinica.model';

@Injectable({ providedIn: 'root' })
export class ClinicaService {
  // ⚠️ Asegúrate de que esta URL coincida con tu backend en Spring Boot
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/clinicas';

  // Mantenemos tu excelente estructura reactiva con Signals
  private _clinicas = signal<Clinica[]>([]);
  public clinicas = computed(() => this._clinicas());

  // Inyectamos el módulo HTTP para poder hablar con Java
  constructor(private http: HttpClient) {
    // El constructor ahora arranca limpio, sin datos hardcodeados
  }

  // 1. GET: Traer la lista real desde la base de datos
  obtenerClinicas(): Observable<Clinica[]> {
    return this.http.get<Clinica[]>(this.apiUrl);
  }

  // 2. POST: Enviar una nueva clínica para que se guarde en la BD
  registrarClinica(clinica: Partial<Clinica>): Observable<Clinica> {
    return this.http.post<Clinica>(this.apiUrl, clinica);
  }

  // 3. Método de apoyo para actualizar tu Signal interno con los datos reales
  actualizarSignal(datosBD: Clinica[]): void {
    this._clinicas.set(datosBD);
  }
}