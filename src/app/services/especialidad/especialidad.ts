import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/especialidades';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  obtenerEspecialidades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.obtenerCabeceras()
    });
  }
}