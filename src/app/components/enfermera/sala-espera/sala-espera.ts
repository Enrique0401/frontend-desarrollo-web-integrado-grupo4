import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

interface CitaApi {
  id: number;
  pacienteId: number;
  fechaHora: string;
  estado: string;
}

interface PacienteApi {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
}

interface ConsultaMedicaApi {
  id?: number;
}

interface CitaSalaEspera {
  id: number;
  fechaHora: string;
  pacienteNombre: string;
  pacienteApellido: string;
  pacienteNumeroDocumento: string;
}

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

  citasEnEspera: CitaSalaEspera[] = [];
  cargando = true;

  ngOnInit() {
    this.cargarPacientesEnSala();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private extraerArray<T>(respuesta: any): T[] {
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta?.content && Array.isArray(respuesta.content)) return respuesta.content;
    if (respuesta?.data && Array.isArray(respuesta.data)) return respuesta.data;
    return [];
  }

  cargarPacientesEnSala() {
    this.cargando = true;

    const headers = this.obtenerHeaders();

    forkJoin({
      citasRespuesta: this.http.get<any>(`${this.urlBase}/citas`, { headers }),
      pacientesRespuesta: this.http.get<any>(`${this.urlBase}/pacientes`, { headers })
    }).pipe(
      switchMap(({ citasRespuesta, pacientesRespuesta }) => {
        const citasConfirmadas = this.extraerArray<CitaApi>(citasRespuesta)
          .filter((cita) => cita.estado?.toUpperCase() === 'CONFIRMADA');

        const pacientes = this.extraerArray<PacienteApi>(pacientesRespuesta);

        const pacientesPorId = new Map(
          pacientes.map((paciente) => [paciente.id, paciente])
        );

        if (citasConfirmadas.length === 0) {
          return of([]);
        }

        const verificaciones = citasConfirmadas.map((cita) =>
          this.http.get<ConsultaMedicaApi>(`${this.urlBase}/consulta-medica/cita/${cita.id}`, { headers }).pipe(
            map((consulta) => ({ cita, consulta })),
            catchError(() => of({ cita, consulta: null }))
          )
        );

        return forkJoin(verificaciones).pipe(
          map((resultados) =>
            resultados
              .filter(({ consulta }) => !consulta?.id)
              .map(({ cita }) => {
                const paciente = pacientesPorId.get(cita.pacienteId);

                return {
                  id: cita.id,
                  fechaHora: cita.fechaHora,
                  pacienteNombre: paciente?.nombre ?? '',
                  pacienteApellido: paciente?.apellido ?? '',
                  pacienteNumeroDocumento: paciente?.numeroDocumento ?? ''
                };
              })
          )
        );
      })
    ).subscribe({
      next: (citas) => {
        this.citasEnEspera = citas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la sala de espera', err);
        this.citasEnEspera = [];
        this.cargando = false;
      }
    });
  }

  llamarPaciente(citaId: number) {
    this.router.navigate(['/panel/enfermeria/triage', citaId]);
  }
}