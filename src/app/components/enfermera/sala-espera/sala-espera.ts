import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sala-espera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala-espera.html',
  styleUrl: './sala-espera.scss'
})
export class SalaEspera implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  citasEnEspera: any[] = [];
  cargando: boolean = true;

  ngOnInit() {
    this.cargarPacientesEnSala();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  cargarPacientesEnSala() {
    this.cargando = true;
    this.http.get<any>(`${this.urlBase}/citas`, { headers: this.obtenerHeaders() }).subscribe({
      next: (respuesta) => {

        // 1. Le decimos explícitamente a TypeScript que es un array de "any"
        let citasArray: any[] = [];

        if (Array.isArray(respuesta)) citasArray = respuesta;
        else if (respuesta && Array.isArray(respuesta.content)) citasArray = respuesta.content;
        else if (respuesta && Array.isArray(respuesta.data)) citasArray = respuesta.data;

        // 2. Le ponemos (c: any) al filter para que el compilador no llore
        this.citasEnEspera = citasArray.filter((c: any) => (c.estado || '').toUpperCase() === 'CONFIRMADA');

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la sala de espera', err);
        this.cargando = false;
      }
    });
  }

  llamarPaciente(citaId: number) {
    // Redirigimos a la pantalla de triage pasándole el ID de la cita por la URL
    this.router.navigate(['/panel/enfermera/triage', citaId]);
  }
}