import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username?: string;
  rol: string;
  clinicaId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/auth';

  login(credenciales: { username: string; password: string }): Observable<AuthResponse> {
    this.limpiarSesion();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.urlBase}/login`, credenciales, { headers }).pipe(
      tap((respuesta) => {
        this.guardarSesion(respuesta);
      })
    );
  }

  iniciarSesion(credenciales: { username: string; password: string }): Observable<AuthResponse> {
    return this.login(credenciales);
  }

  registrar(datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.urlBase}/register`, datos, { headers });
  }

  getPerfil(): Observable<any> {
    const token = this.obtenerToken();

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.urlBase}/me`, { headers });
  }

  guardarSesion(respuesta: AuthResponse): void {
    this.limpiarSesion();

    if (respuesta.token) {
      localStorage.setItem('token', respuesta.token);
    }

    if (respuesta.rol) {
      localStorage.setItem('rol', respuesta.rol);
    }

    if (respuesta.username) {
      localStorage.setItem('username', respuesta.username);
    }

    if (respuesta.clinicaId !== null && respuesta.clinicaId !== undefined) {
      localStorage.setItem('clinicaId', String(respuesta.clinicaId));
    }
  }

  limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('clinicaId');
    localStorage.removeItem('usuario');
    localStorage.removeItem('username');
  }

  logout(): void {
    this.limpiarSesion();
  }

  cerrarSesion(): void {
    this.logout();
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  getToken(): string | null {
    return this.obtenerToken();
  }

  obtenerRol(): string | null {
    return localStorage.getItem('rol');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
}
