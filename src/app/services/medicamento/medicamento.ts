import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/medicamentos';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  obtenerPorEspecialidad(especialidadId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/especialidad/${especialidadId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  buscarActivos(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar-activos?term=${term}`, {
      headers: this.obtenerCabeceras()
    });
  }
}