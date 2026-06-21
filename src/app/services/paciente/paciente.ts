import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private apiUrl = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/pacientes';

  constructor(private http: HttpClient) {}

  // Función privada para armar la cabecera con el Token
  private obtenerCabeceras(): HttpHeaders {
    // Sacamos el token que guardaste cuando hiciste Login
    const token = localStorage.getItem('token'); 
    
    // Si hay token, lo mandamos en el formato "Bearer [token]"
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    
    // Si por alguna razón no hay token, mandamos cabeceras vacías
    return new HttpHeaders();
  }

  // GET: Traer pacientes (¡Ahora con seguridad!)
  obtenerPacientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { 
      headers: this.obtenerCabeceras() // <--- ¡Aquí enviamos el fotocheck al backend!
    });
  }

  // POST: Crear paciente (También requiere seguridad)
  registrarPaciente(paciente: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, paciente, { 
      headers: this.obtenerCabeceras() 
    });
  }
}