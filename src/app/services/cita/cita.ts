import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../../models/atencion-medica.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/citas';

  private _citas = signal<Cita[]>([]);
  public citas = computed(() => this._citas());

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    }

    return new HttpHeaders();
  }

  obtenerCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl, {
      headers: this.obtenerCabeceras()
    });
  }

  actualizarSignal(datosBD: Cita[]): void {
    this._citas.set(datosBD);
  }
}