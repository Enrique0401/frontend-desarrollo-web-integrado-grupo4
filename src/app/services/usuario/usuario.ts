import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/usuarios';

  private _usuarioActual = signal<Usuario | null>(null);
  public usuarioActual = computed(() => this._usuarioActual());

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerAdminsClinica(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rol/ADMIN_CLINICA`, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerPorClinica(clinicaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clinica/${clinicaId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerPorUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/username/${username}`, {
      headers: this.obtenerCabeceras()
    });
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario, {
      headers: this.obtenerCabeceras()
    });
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuario, {
      headers: this.obtenerCabeceras()
    });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }

  logout(): void {
    this._usuarioActual.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }
}