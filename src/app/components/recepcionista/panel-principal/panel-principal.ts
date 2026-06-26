import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-principal.html',
  styleUrl: './panel-principal.scss',
})
export class PanelPrincipal implements OnInit {
  citasHoy: any[] = [];
  citasEnEspera: number = 0;
  citasPendientesPago: number = 0;
  cargando: boolean = true;
  errorMensaje: string = '';

  private http = inject(HttpClient);

  ngOnInit() {
    this.cargarResumenDelDia();
  }

  cargarResumenDelDia() {
    // Apuntamos al endpoint general de citas. Como el recepcionista tiene acceso, el backend devolverá la lista.
    const urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/citas';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(urlBackend, { headers }).subscribe({
      next: (data) => {
        // 1. Obtenemos la fecha actual en formato YYYY-MM-DD
        const hoy = new Date().toLocaleDateString('en-CA'); // en-CA da el formato YYYY-MM-DD compatible con la ISO de la base de datos

        // 2. Filtramos SOLO las citas que coinciden con el día de hoy
        this.citasHoy = data.filter(cita => {
          // Buscamos la fecha en las posibles variables que tu compañero de backend haya usado
          const fechaCitaStr = cita.fechaHora || cita.fechaCita || cita.fechaConsulta;
          if (!fechaCitaStr) return false;
          return fechaCitaStr.startsWith(hoy);
        }).sort((a, b) => {
          const timeA = new Date(a.fechaHora || a.fechaCita || a.fechaConsulta).getTime();
          const timeB = new Date(b.fechaHora || b.fechaCita || b.fechaConsulta).getTime();
          return timeA - timeB; // Ordenar cronológicamente
        });

        // 3. Calculamos las estadísticas leyendo los estados
        this.citasEnEspera = this.citasHoy.filter(c =>
          c.estado === 'EN_ESPERA' || c.estado === 'PENDIENTE'
        ).length;

        // Validamos si la cita está pagada (dependiendo de cómo lo maneje tu backend: boolean o String)
        this.citasPendientesPago = this.citasHoy.filter(c =>
          c.estadoPago === 'PENDIENTE' || c.pagado === false || !c.estadoPago
        ).length;

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener citas del día:', error);
        this.errorMensaje = 'No se pudo establecer conexión con el servidor para cargar el resumen.';
        this.cargando = false;
      }
    });
  }

  // Helper para formatear la hora (Ej: 14:30)
  formatearHora(fechaIso: string): string {
    if (!fechaIso) return '--:--';
    const date = new Date(fechaIso);
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}