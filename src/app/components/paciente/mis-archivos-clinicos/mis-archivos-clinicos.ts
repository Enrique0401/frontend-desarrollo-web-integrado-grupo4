import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-mis-archivos-clinicos',
  imports: [CommonModule],
  templateUrl: './mis-archivos-clinicos.html',
  styleUrl: './mis-archivos-clinicos.scss',
})
export class MisArchivosClinicos implements OnInit {
  archivos: any[] = [];
  cargando: boolean = true;
  errorMensaje: string = '';

  private http = inject(HttpClient);

  ngOnInit() {
    this.obtenerHistoriaClinica();
  }

  obtenerHistoriaClinica() {
    // Ruta segura que tu backend deberá tener para devolver los archivos del paciente
    const urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/archivos/mis-archivos';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(urlBackend, { headers }).subscribe({
      next: (data) => {
        // Ordenamos los archivos del más reciente al más antiguo por fecha de subida
        this.archivos = data.sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime());
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener historia clínica:', error);
        this.errorMensaje = 'No pudimos cargar tus archivos clínicos en este momento.';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Pequeña lógica para asignar un ícono visual según el tipo de archivo (PDF, JPG, etc.)
  obtenerIconoPorTipo(tipo: string): string {
    const t = tipo ? tipo.toLowerCase() : '';
    if (t.includes('pdf')) return 'pi-file-pdf';
    if (t.includes('jpg') || t.includes('png') || t.includes('jpeg')) return 'pi-image';
    if (t.includes('doc') || t.includes('word')) return 'pi-file-word';
    if (t.includes('xls') || t.includes('excel')) return 'pi-file-excel';
    return 'pi-file'; 
  }
}