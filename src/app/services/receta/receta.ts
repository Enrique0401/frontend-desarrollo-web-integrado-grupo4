import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecetaService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/recetas';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  crearReceta(receta: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, receta, {
      headers: this.obtenerCabeceras()
    });
  }
}