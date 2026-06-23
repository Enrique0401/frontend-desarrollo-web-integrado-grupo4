import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-mi-historia-clinica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-historia-clinica.html',
  styleUrl: './mi-historia-clinica.scss',
})
export class MiHistoriaClinica implements OnInit {
  historia: any = null;
  cargando: boolean = true;
  errorMensaje: string = '';

  private http = inject(HttpClient);

  ngOnInit() {
    this.obtenerMiHistoria();
  }

  obtenerMiHistoria() {
    // Ruta segura para obtener el expediente único del paciente logueado
    const urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/historia-clinica/mi-historial';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any>(urlBackend, { headers }).subscribe({
      next: (data) => {
        this.historia = data;
        
        // Si hay consultas, las ordenamos de la más reciente a la más antigua
        if (this.historia && this.historia.consultas) {
          this.historia.consultas.sort((a: any, b: any) => 
            new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime()
          );
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener la historia clínica:', error);
        // Si el error es 404, significa que el paciente es nuevo y aún no le abren historia
        if (error.status === 404) {
          this.historia = null;
        } else {
          this.errorMensaje = 'No pudimos cargar tu historia clínica en este momento.';
        }
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