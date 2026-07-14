import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credenciales);
  }

  registrar(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, datos);
  }

  // MÉTODO NUEVO: Para obtener los datos del usuario logueado usando su token
  getPerfil(): Observable<any> {
    const token = localStorage.getItem('token');
    
    // Configuramos los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Llamamos al endpoint /me que configuramos en tu AuthController
    return this.http.get(`${this.apiUrl}/auth/me`, { headers });
  }
}