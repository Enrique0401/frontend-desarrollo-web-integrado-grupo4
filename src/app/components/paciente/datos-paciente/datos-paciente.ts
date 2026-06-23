import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-datos-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datos-paciente.html',
  styleUrl: './datos-paciente.scss',
})
export class DatosPaciente implements OnInit {
  paciente: any = null;
  cargando: boolean = true;
  errorMensaje: string = '';

  private http = inject(HttpClient);

  ngOnInit() {
    this.obtenerMiPerfil();
  }

  obtenerMiPerfil() {
    const urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/pacientes/perfil';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.get(urlBackend, { headers: headers }).subscribe({
      next: (data) => {
        this.paciente = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al conectar con el servidor:', error);
        this.errorMensaje = 'No se pudo cargar tu información. Intenta nuevamente más tarde.';
        this.cargando = false;
      }
    });
  }

  verificarDato(dato: any): string {
    return dato ? dato : 'Pendiente de registro en clínica';
  }
}