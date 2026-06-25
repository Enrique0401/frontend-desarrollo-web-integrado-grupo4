import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/horarios';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  obtenerHorarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.obtenerCabeceras()
    });
  }

  crearHorario(horario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, horario, {
      headers: this.obtenerCabeceras()
    });
  }

  actualizarHorario(id: number, horario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, horario, {
      headers: this.obtenerCabeceras()
    });
  }

  eliminarHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }
}