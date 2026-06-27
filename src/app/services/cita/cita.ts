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
        Authorization: `Bearer ${token}`,
      });
    }

    return new HttpHeaders();
  }

  obtenerCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl, {
      headers: this.obtenerCabeceras(),
    });
  }
  obtenerCitasClinicaPorRango(clinicaId: number, inicio: string, fin: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/clinica/${clinicaId}/rango?inicio=${inicio}&fin=${fin}`,
      { headers: this.obtenerCabeceras() },
    );
  }
  actualizarSignal(datosBD: Cita[]): void {
    this._citas.set(datosBD);
  }
  contarPorClinica(clinicaId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/clinica/${clinicaId}/contar`, {
      headers: this.obtenerCabeceras(),
    });
  }
  obtenerCitasMedico(medicoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medico/${medicoId}`, {
      headers: this.obtenerCabeceras(),
    });
  }
  obtenerCitaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.obtenerCabeceras(),
    });
  }

  actualizarCita(id: number, cita: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cita, {
      headers: this.obtenerCabeceras(),
    });
  }
}
