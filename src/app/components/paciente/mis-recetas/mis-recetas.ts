import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-mis-recetas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-recetas.html',
  styleUrl: './mis-recetas.scss',
})
export class MisRecetas implements OnInit {
  recetas: any[] = [];
  cargando: boolean = true;
  errorMensaje: string = '';

  private http = inject(HttpClient);

  ngOnInit() {
    this.obtenerMisRecetas();
  }

  obtenerMisRecetas() {
    // Ruta segura que extrae las recetas del paciente autenticado desde su JWT
    const urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/recetas/mis-recetas';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(urlBackend, { headers }).subscribe({
      next: (data) => {
        // Ordenamos las recetas de la más reciente a la más antigua
        this.recetas = data.sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener recetas:', error);
        this.errorMensaje = 'No pudimos cargar tus recetas médicas en este momento.';
        this.cargando = false;
      }
    });
  }

  formatearFecha(fechaFormatoISO: string): string {
    if (!fechaFormatoISO) return 'Fecha no disponible';
    const date = new Date(fechaFormatoISO);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }
}