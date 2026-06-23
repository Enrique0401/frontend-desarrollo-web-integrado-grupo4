import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.scss',
})
export class MisCitas implements OnInit {
  citas: any[] = [];
  cargando: boolean = true;
  errorMensaje: string = '';

  private http = inject(HttpClient);

  ngOnInit() {
    this.obtenerMisCitas();
  }

  obtenerMisCitas() {
    const urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/citas/mis-citas';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(urlBackend, { headers }).subscribe({
      next: (data) => {
        // Ordenamos las citas de la más reciente a la más antigua
        this.citas = data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener citas:', error);
        this.errorMensaje = 'No pudimos cargar tus citas en este momento.';
        this.cargando = false;
      }
    });
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA': return 'badge-programada';
      case 'CONFIRMADA': return 'badge-confirmada';
      case 'COMPLETADA': return 'badge-completada';
      case 'CANCELADA': return 'badge-cancelada';
      case 'NO_ASISTIO': return 'badge-no-asistio';
      default: return 'badge-default';
    }
  }

  formatearFecha(fechaFormatoISO: string): string {
    if (!fechaFormatoISO) return 'Por definir';
    const date = new Date(fechaFormatoISO);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}