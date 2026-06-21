import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinica } from '../../models/clinica.model';

@Injectable({ providedIn: 'root' })
export class ClinicaService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/clinicas';

  private _clinicas = signal<Clinica[]>([]);
  public clinicas = computed(() => this._clinicas());

  constructor(private http: HttpClient) {}

  obtenerClinicas(): Observable<Clinica[]> {
    return this.http.get<Clinica[]>(this.apiUrl);
  }

  registrarClinica(clinica: Partial<Clinica>): Observable<Clinica> {
    return this.http.post<Clinica>(this.apiUrl, clinica);
  }

  // NUEVO: Método para actualizar la clínica (Editar o cambiar estado)
  actualizar(id: number, clinica: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, clinica);
  }

  actualizarSignal(datosBD: Clinica[]): void {
    this._clinicas.set(datosBD);
  }
}