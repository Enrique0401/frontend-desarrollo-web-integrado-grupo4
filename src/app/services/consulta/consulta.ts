import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private apiUrl =
    'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/consulta-medica';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  guardarConsulta(consulta: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, consulta, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerPorPaciente(pacienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paciente/${pacienteId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerPorMedico(medicoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medico/${medicoId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerPorHistoria(historiaClinicaId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/historia/${historiaClinicaId}`,
      { headers: this.obtenerCabeceras() }
    );
  }
  obtenerPorCita(citaId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/cita/${citaId}`, {
    headers: this.obtenerCabeceras()
  });
}

actualizarConsulta(id: number, consulta: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${id}`, consulta, {
    headers: this.obtenerCabeceras()
  });
}
}