import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/medicos';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  obtenerPorClinica(clinicaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clinica/${clinicaId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  crearMedico(medico: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, medico, {
      headers: this.obtenerCabeceras()
    });
  }
}