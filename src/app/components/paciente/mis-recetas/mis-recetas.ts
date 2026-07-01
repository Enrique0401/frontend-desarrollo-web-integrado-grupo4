import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-mis-recetas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-recetas.html',
  styleUrl: './mis-recetas.scss',
})
export class MisRecetas implements OnInit {
  recetas: any[] = [];
  citasPaciente: any[] = [];
  cargando = true;
  errorMensaje = '';

  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  ngOnInit() {
    this.obtenerMisRecetas();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  obtenerMisRecetas() {
    this.cargando = true;
    this.errorMensaje = '';

    const headers = this.obtenerHeaders();

    forkJoin({
      recetas: this.http.get<any[]>(`${this.urlBase}/recetas/mis-recetas`, { headers }),
      citas: this.http.get<any[]>(`${this.urlBase}/citas/mis-citas`, { headers }).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      switchMap(({ recetas, citas }) => {
        const recetasBase = this.extraerArray(recetas);
        this.citasPaciente = this.extraerArray(citas);

        if (recetasBase.length === 0) {
          return of([]);
        }

        return forkJoin(
          recetasBase.map((receta) => this.enriquecerReceta(receta))
        );
      })
    ).subscribe({
      next: (recetasEnriquecidas) => {
        this.recetas = recetasEnriquecidas.sort(
          (a, b) => new Date(b.fechaEmision || 0).getTime() - new Date(a.fechaEmision || 0).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener recetas:', error);
        this.errorMensaje = 'No pudimos cargar tus recetas médicas en este momento.';
        this.cargando = false;
      }
    });
  }

  private enriquecerReceta(receta: any) {
    const consultaId = this.obtenerConsultaId(receta);

    if (!consultaId) {
      const cita = this.buscarCitaRelacionada(receta, null);
      return of({
        ...receta,
        consultaInfo: receta.consulta || receta.consultaMedica || null,
        citaInfo: cita,
        citaIdVista: this.obtenerCitaId(receta, null, cita),
        consultaIdVista: null
      });
    }

    return this.http.get<any>(`${this.urlBase}/consulta-medica/${consultaId}`, {
      headers: this.obtenerHeaders()
    }).pipe(
      catchError(() => of(null)),
      map((consulta) => {
        const cita = this.buscarCitaRelacionada(receta, consulta);

        return {
          ...receta,
          consultaInfo: consulta || receta.consulta || receta.consultaMedica || null,
          citaInfo: cita,
          citaIdVista: this.obtenerCitaId(receta, consulta, cita),
          consultaIdVista: consulta?.id || consultaId
        };
      })
    );
  }

  private extraerArray(respuesta: any): any[] {
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta?.content && Array.isArray(respuesta.content)) return respuesta.content;
    if (respuesta?.data && Array.isArray(respuesta.data)) return respuesta.data;
    return [];
  }

  private obtenerConsultaId(receta: any): number | null {
    const id = Number(
      receta.consultaMedicaId ??
      receta.consultaId ??
      receta.consulta?.id ??
      receta.consultaMedica?.id
    );

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private obtenerCitaId(receta: any, consulta?: any, cita?: any): number | null {
    const id = Number(
      receta.citaId ??
      receta.cita?.id ??
      receta.consulta?.citaId ??
      receta.consultaMedica?.citaId ??
      consulta?.citaId ??
      consulta?.cita?.id ??
      cita?.id ??
      cita?.idCita
    );

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private buscarCitaRelacionada(receta: any, consulta: any): any | null {
    const citaId = this.obtenerCitaId(receta, consulta, null);

    if (!citaId) return null;

    return this.citasPaciente.find((cita) =>
      Number(cita.id || cita.idCita) === Number(citaId)
    ) || null;
  }

  obtenerNombreMedico(receta: any): string {
    const cita = receta.citaInfo;
    const consulta = receta.consultaInfo;

    const nombre =
      receta.medicoNombre ??
      receta.medico?.nombre ??
      receta.medico?.usuario?.nombre ??
      consulta?.medicoNombre ??
      consulta?.medico?.nombre ??
      cita?.medicoNombre ??
      cita?.medico?.nombre ??
      cita?.medico?.usuario?.nombre;

    const apellido =
      receta.medicoApellido ??
      receta.medico?.apellido ??
      receta.medico?.usuario?.apellido ??
      consulta?.medicoApellido ??
      consulta?.medico?.apellido ??
      cita?.medicoApellido ??
      cita?.medico?.apellido ??
      cita?.medico?.usuario?.apellido;

    if (!nombre && !apellido) {
      return 'Médico no disponible';
    }

    return `Dr(a). ${nombre || ''} ${apellido || ''}`.trim();
  }

  obtenerConsultaVista(receta: any): string {
    const consultaId = receta.consultaIdVista || this.obtenerConsultaId(receta);
    return consultaId ? `Consulta ID #${consultaId}` : 'Consulta no disponible';
  }

  obtenerCitaVista(receta: any): string {
    const citaId = receta.citaIdVista || this.obtenerCitaId(receta, receta.consultaInfo, receta.citaInfo);
    return citaId ? `Cita ID #${citaId}` : 'Cita no disponible';
  }

  obtenerMotivoConsulta(receta: any): string {
    return receta.consultaInfo?.motivo ||
      receta.consultaInfo?.motivoConsulta ||
      receta.citaInfo?.motivo ||
      receta.citaInfo?.motivoConsulta ||
      'Atención médica';
  }

  formatearFrecuencia(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return 'No indicada';
    }

    const texto = String(valor);
    const numero = texto.match(/\d+/)?.[0];

    return numero ? `cada ${numero} horas` : texto;
  }

  formatearDuracion(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return 'No indicada';
    }

    const texto = String(valor);
    const numero = texto.match(/\d+/)?.[0];

    return numero ? `${numero} días` : texto;
  }

  formatearFecha(fechaFormatoISO: string): string {
    if (!fechaFormatoISO) return 'Fecha no disponible';

    const date = new Date(fechaFormatoISO);

    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}