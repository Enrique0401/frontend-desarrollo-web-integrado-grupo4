import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './gestion-citas.html',
  styleUrl: './gestion-citas.scss',
})
export class GestionCitas implements OnInit {
  todasLasCitas: any[] = [];
  citas: any[] = [];
  medicos: any[] = [];
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  especialidades: any[] = [];
  clinicas: any[] = [];
  consultorios: any[] = [];
  horarios: any[] = [];

  medicosBaseEspecialidad: any[] = [];
  medicosDisponibles: any[] = [];

  horariosMedicoSeleccionado: any[] = [];
  slotsMedicoSeleccionado: any[] = [];
  cargandoHorariosMedico = false;
  mensajeHorariosMedico = '';

  filtroPaciente = '';
  cargando = true;
  mostrarFormulario = false;

  clinicaId: number | null = null;
  mensajeDisponibilidad = '';

  duracionesCita = [15, 30, 45, 60, 75, 90, 105, 120];
  fechaMinima = '';
  horaMinima = '';
  fechaSeleccionada = '';
  horaSeleccionada = '';

  fechaFiltroCitas = '';
  etiquetaFiltroCitas = 'Todas las citas';

  nuevaCita = {
    pacienteId: '',
    especialidadId: '',
    medicoId: '',
    clinicaId: '',
    duracionMinutos: 30,
    fechaHora: '',
    motivoConsulta: '',
    estado: 'PENDIENTE'
  };

  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  ngOnInit() {
    this.actualizarFechaMinima();
    this.cargarDatosEstructurales();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private obtenerClinicaIdDesdeToken(): number | null {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const clinicaId = Number(payload.clinicaId);
      return Number.isFinite(clinicaId) ? clinicaId : null;
    } catch {
      return null;
    }
  }

  cargarDatosEstructurales() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    this.clinicaId = this.obtenerClinicaIdDesdeToken();

    forkJoin({
      citas: this.http.get<any[]>(`${this.urlBase}/citas`, { headers }),
      medicos: this.http.get<any[]>(`${this.urlBase}/medicos`, { headers }),
      pacientes: this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }),
      especialidades: this.http.get<any[]>(`${this.urlBase}/especialidades/activas`, { headers }),
      clinicas: this.http.get<any[]>(`${this.urlBase}/clinicas`, { headers }),
      consultorios: this.http.get<any[]>(`${this.urlBase}/consultorios`, { headers }),
      horarios: this.http.get<any[]>(`${this.urlBase}/horarios`, { headers })
    }).subscribe({
      next: ({ citas, medicos, pacientes, especialidades, clinicas, consultorios, horarios }) => {
        this.todasLasCitas = this.obtenerArray(citas).sort(
          (a, b) =>
            new Date(b.fechaHora || b.fechaCita || b.fecha || 0).getTime() -
            new Date(a.fechaHora || a.fechaCita || a.fecha || 0).getTime()
        );

        this.medicos = this.obtenerArray(medicos);
        this.pacientes = this.obtenerArray(pacientes);
        this.pacientesFiltrados = [...this.pacientes];
        this.especialidades = this.obtenerArray(especialidades);
        this.clinicas = this.obtenerArray(clinicas);
        this.consultorios = this.obtenerArray(consultorios);
        this.horarios = this.obtenerArray(horarios);

        if (this.clinicaId) {
          this.nuevaCita.clinicaId = String(this.clinicaId);
        }

        this.aplicarFiltroFechaCitas();
        this.generarSlotsMedicoSeleccionado();

        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.mostrarAlerta('Ocurrio un error al sincronizar con el servidor medico.', false);
        this.cargando = false;
      }
    });
  }

  private obtenerArray(respuesta: any): any[] {
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta && Array.isArray(respuesta.content)) return respuesta.content;
    if (respuesta && Array.isArray(respuesta.data)) return respuesta.data;
    return [];
  }

  mostrarTodasLasCitas() {
    this.fechaFiltroCitas = '';
    this.etiquetaFiltroCitas = 'Todas las citas';
    this.aplicarFiltroFechaCitas();
  }

  filtrarCitasHoy() {
    this.asignarFiltroPorFecha(new Date(), 'Citas de hoy');
  }

  filtrarCitasManana() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1);
    this.asignarFiltroPorFecha(fecha, 'Citas de manana');
  }

  filtrarCitasEnDias(dias: number, etiqueta: string) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    this.asignarFiltroPorFecha(fecha, etiqueta);
  }

  aplicarFiltroFechaCitasDesdeInput() {
    if (!this.fechaFiltroCitas) {
      this.mostrarTodasLasCitas();
      return;
    }

    this.etiquetaFiltroCitas = `Citas del ${this.formatearFechaFiltro(this.fechaFiltroCitas)}`;
    this.aplicarFiltroFechaCitas();
  }

  private asignarFiltroPorFecha(fecha: Date, etiqueta: string) {
    this.fechaFiltroCitas = this.formatearFechaInput(fecha);
    this.etiquetaFiltroCitas = etiqueta;
    this.aplicarFiltroFechaCitas();
  }

  private aplicarFiltroFechaCitas() {
    if (!this.fechaFiltroCitas) {
      this.citas = [...this.todasLasCitas];
      return;
    }

    this.citas = this.todasLasCitas.filter((cita) => {
      const fechaCita = new Date(cita.fechaHora || cita.fechaCita || cita.fecha);
      if (Number.isNaN(fechaCita.getTime())) return false;
      return this.formatearFechaInput(fechaCita) === this.fechaFiltroCitas;
    });
  }

  private formatearFechaFiltro(fechaTexto: string): string {
    const fecha = new Date(`${fechaTexto}T00:00:00`);

    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getNombrePaciente(id: number): string {
    const pac = this.pacientes.find((p) => Number(p.id) === Number(id));

    return pac
      ? `${pac.nombre || pac.usuario?.nombre || ''} ${pac.apellido || pac.usuario?.apellido || ''}`.trim()
      : 'Desconocido';
  }

  getNombreMedico(id: number): string {
    const med = this.medicos.find((m) => Number(m.id) === Number(id));

    return med
      ? `Dr(a). ${med.nombre || med.usuario?.nombre || ''} ${med.apellido || med.usuario?.apellido || ''}`.trim()
      : 'No asignado';
  }

  filtrarPacientes() {
    const termino = this.filtroPaciente.toLowerCase().trim();

    if (!termino) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    this.pacientesFiltrados = this.pacientes.filter((p) => {
      const nombre = (p.nombre || p.usuario?.nombre || '').toLowerCase();
      const apellido = (p.apellido || p.usuario?.apellido || '').toLowerCase();
      const documento = (
        p.numeroDocumento ||
        p.dni ||
        p.usuario?.dni ||
        p.usuario?.numeroDocumento ||
        ''
      ).toString();

      return `${nombre} ${apellido}`.includes(termino) || documento.includes(termino);
    });
  }

  actualizarFechaMinima() {
    const ahora = new Date();
    this.fechaMinima = this.formatearFechaInput(ahora);
    this.actualizarHoraMinima();
  }

  actualizarHoraMinima() {
    const ahora = new Date();
    const hoy = this.formatearFechaInput(ahora);

    if (this.fechaSeleccionada === hoy) {
      const minSiguiente = new Date(ahora.getTime() + 60_000);
      const hh = String(minSiguiente.getHours()).padStart(2, '0');
      const mm = String(minSiguiente.getMinutes()).padStart(2, '0');
      this.horaMinima = `${hh}:${mm}`;
    } else {
      this.horaMinima = '00:00';
    }
  }

  onSedeChange() {
    this.nuevaCita.medicoId = '';
    this.medicosBaseEspecialidad = [];
    this.medicosDisponibles = [];
    this.mensajeDisponibilidad = '';
    this.limpiarAgendaMedico();

    if (this.nuevaCita.especialidadId) {
      this.onEspecialidadChange();
    }
  }

  onEspecialidadChange() {
    this.nuevaCita.medicoId = '';
    this.medicosBaseEspecialidad = [];
    this.medicosDisponibles = [];
    this.mensajeDisponibilidad = '';
    this.limpiarAgendaMedico();

    const sedeId = Number(this.nuevaCita.clinicaId);

    if (!sedeId) {
      this.mensajeDisponibilidad = 'Selecciona una sede para filtrar medicos.';
      return;
    }

    if (!this.nuevaCita.especialidadId) return;

    const headers = this.obtenerHeaders();

    this.http.get<any[]>(
      `${this.urlBase}/medicos/activos/especialidad-clinica?clinicaId=${sedeId}&especialidadId=${this.nuevaCita.especialidadId}`,
      { headers }
    ).subscribe({
      next: (medicos) => {
        this.medicosBaseEspecialidad = this.obtenerArray(medicos);
        this.actualizarMedicosDisponibles();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('No se pudieron cargar los medicos de la sede y especialidad.', false);
      }
    });
  }

  onFechaChange() {
    this.actualizarHoraMinima();
    this.actualizarMedicosDisponibles();
    this.generarSlotsMedicoSeleccionado();
  }

  onHoraChange() {
    this.actualizarMedicosDisponibles();
    this.generarSlotsMedicoSeleccionado();
  }

  onMedicoChange() {
    this.cargarHorariosMedicoSeleccionado();
  }

  actualizarMedicosDisponibles() {
    const medicoActual = this.nuevaCita.medicoId;
    const sedeId = Number(this.nuevaCita.clinicaId);

    this.mensajeDisponibilidad = '';

    if (!sedeId) {
      this.medicosDisponibles = [];
      this.mensajeDisponibilidad = 'Selecciona una sede para filtrar medicos.';
      return;
    }

    if (!this.nuevaCita.especialidadId) {
      this.medicosDisponibles = [];
      return;
    }

    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.medicosDisponibles = [...this.medicosBaseEspecialidad];

      if (medicoActual && !this.medicosDisponibles.some((m) => Number(m.id) === Number(medicoActual))) {
        this.nuevaCita.medicoId = '';
        this.limpiarAgendaMedico();
      }

      this.mensajeDisponibilidad = 'Selecciona fecha y hora para validar disponibilidad.';
      return;
    }

    if (this.medicosBaseEspecialidad.length === 0) {
      this.medicosDisponibles = [];
      this.mensajeDisponibilidad = 'No hay medicos activos para esa sede y especialidad.';
      return;
    }

    const diaSemana = this.obtenerDiaSemanaBackend(this.fechaSeleccionada);

    const validaciones = this.medicosBaseEspecialidad.map((medico) => {
      const medicoId = Number(medico.id);

      return this.obtenerHorariosMedicoPorDia(medicoId, diaSemana).pipe(
        map((horariosBackend) => {
          let horarios = horariosBackend;

          if (horarios.length === 0) {
            horarios = this.obtenerHorariosLocalesPorMedicoYDia(medicoId, diaSemana);
          }

          return {
            medico,
            disponible:
              this.medicoAtiendeEnHorarios(horarios, diaSemana, false) &&
              !this.medicoTieneCitaCruzada(medicoId)
          };
        })
      );
    });

    forkJoin(validaciones).subscribe({
      next: (resultados) => {
        this.medicosDisponibles = resultados
          .filter((r) => r.disponible)
          .map((r) => r.medico);

        if (medicoActual && !this.medicosDisponibles.some((m) => Number(m.id) === Number(medicoActual))) {
          this.nuevaCita.medicoId = '';
          this.limpiarAgendaMedico();
        } else if (medicoActual) {
          this.cargarHorariosMedicoSeleccionado();
        }

        this.mensajeDisponibilidad = this.medicosDisponibles.length === 0
          ? 'No hay medicos disponibles para esa sede, especialidad, fecha y hora.'
          : '';
      },
      error: (err) => {
        console.error(err);
        this.medicosDisponibles = [];
        this.mensajeDisponibilidad = 'No se pudo validar la disponibilidad de los medicos.';
      }
    });
  }

  private validarDisponibilidadMedico(medicoId: number) {
    const diaSemana = this.obtenerDiaSemanaBackend(this.fechaSeleccionada);

    return this.obtenerHorariosMedicoPorDia(medicoId, diaSemana).pipe(
      map((horariosBackend) => {
        let horarios = horariosBackend;

        if (horarios.length === 0) {
          horarios = this.obtenerHorariosLocalesPorMedicoYDia(medicoId, diaSemana);
        }

        const atiende = this.medicoAtiendeEnHorarios(horarios, diaSemana, true);
        const cruzada = this.medicoTieneCitaCruzada(medicoId);

        return atiende && !cruzada;
      })
    );
  }

  private obtenerHorariosMedicoPorDia(medicoId: number, diaSemana: string) {
    const headers = this.obtenerHeaders();

    return this.http.get<any[]>(
      `${this.urlBase}/horarios/medico/${medicoId}/dia/${diaSemana}`,
      { headers }
    ).pipe(
      map((respuesta) => this.obtenerArray(respuesta)),
      catchError((err) => {
        console.error('Error cargando horario del medico:', medicoId, diaSemana, err);
        return of([]);
      })
    );
  }

  private obtenerHorariosLocalesPorMedicoYDia(medicoId: number, diaSemana: string): any[] {
    return this.horarios.filter((h) => {
      const idMedicoHorario = Number(
        h.medicoId ??
        h.medico_id ??
        h.idMedico ??
        h.medico?.id ??
        h.medico?.idMedico
      );

      const diaHorario = String(
        h.diaSemana ??
        h.dia_semana ??
        h.dia ??
        ''
      ).toUpperCase();

      return idMedicoHorario === Number(medicoId) && diaHorario === diaSemana;
    });
  }

  private medicoAtiendeEnHorarios(horarios: any[], diaSemana: string, actualizarMensaje: boolean): boolean {
    if (!this.fechaSeleccionada || !this.horaSeleccionada) return false;

    const sedeId = Number(this.nuevaCita.clinicaId);

    if (!sedeId) {
      if (actualizarMensaje) {
        this.mensajeDisponibilidad = 'Selecciona una sede para validar el horario del medico.';
      }

      return false;
    }

    if (horarios.length === 0) {
      if (actualizarMensaje) {
        this.mensajeDisponibilidad = `El medico no tiene horario activo para ${diaSemana}.`;
      }

      return false;
    }

    const inicioCita = this.horaAMinutos(this.horaSeleccionada);
    const finCita = inicioCita + Number(this.nuevaCita.duracionMinutos || 30);

    const horariosValidos = horarios.filter((h) => {
      if (!this.horarioEstaActivo(h)) return false;

      const horarioClinicaId = Number(
        h.clinicaId ??
        h.clinica_id ??
        h.clinica?.id ??
        h.idClinica
      );

      if (horarioClinicaId && horarioClinicaId !== sedeId) {
        return false;
      }

      return true;
    });

    if (horariosValidos.length === 0) {
      if (actualizarMensaje) {
        this.mensajeDisponibilidad = 'El medico tiene horario registrado, pero no pertenece a la sede seleccionada o no esta activo.';
      }

      return false;
    }

    const disponible = horariosValidos.some((h) => {
      const inicioHorario = this.extraerHoraComoMinutos(h.horaInicio ?? h.hora_inicio);
      const finHorario = this.extraerHoraComoMinutos(h.horaFin ?? h.hora_fin);

      if (inicioHorario === null || finHorario === null) return false;

      return inicioCita >= inicioHorario && finCita <= finHorario;
    });

    if (!disponible && actualizarMensaje) {
      const resumenHorarios = horariosValidos
        .map((h) => `${h.horaInicio ?? h.hora_inicio} - ${h.horaFin ?? h.hora_fin}`)
        .join(', ');

      this.mensajeDisponibilidad = `El medico atiende ${diaSemana}, pero no en esa hora. Horario: ${resumenHorarios}.`;
    }

    return disponible;
  }

  cargarHorariosMedicoSeleccionado() {
    const medicoId = Number(this.nuevaCita.medicoId);
    const sedeId = Number(this.nuevaCita.clinicaId);

    this.horariosMedicoSeleccionado = [];
    this.slotsMedicoSeleccionado = [];
    this.mensajeHorariosMedico = '';

    if (!medicoId) return;

    this.cargandoHorariosMedico = true;

    this.http.get<any[]>(
      `${this.urlBase}/horarios/medico/${medicoId}`,
      { headers: this.obtenerHeaders() }
    ).subscribe({
      next: (respuesta) => {
        const horarios = this.obtenerArray(respuesta);

        this.horariosMedicoSeleccionado = horarios
          .filter((h) => this.horarioEstaActivo(h))
          .filter((h) => {
            const clinicaHorarioId = Number(
              h.clinicaId ??
              h.clinica_id ??
              h.clinica?.id ??
              h.idClinica
            );

            return !clinicaHorarioId || !sedeId || clinicaHorarioId === sedeId;
          })
          .sort((a, b) => {
            const diaA = this.ordenDiaSemana(a.diaSemana ?? a.dia_semana);
            const diaB = this.ordenDiaSemana(b.diaSemana ?? b.dia_semana);

            if (diaA !== diaB) return diaA - diaB;

            const horaA = this.extraerHoraComoMinutos(a.horaInicio ?? a.hora_inicio) ?? 0;
            const horaB = this.extraerHoraComoMinutos(b.horaInicio ?? b.hora_inicio) ?? 0;

            return horaA - horaB;
          });

        if (this.horariosMedicoSeleccionado.length === 0) {
          this.mensajeHorariosMedico = 'Este medico no tiene horarios registrados para la sede seleccionada.';
        }

        this.generarSlotsMedicoSeleccionado();
        this.cargandoHorariosMedico = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios del medico:', err);
        this.mensajeHorariosMedico = 'No se pudieron cargar los horarios del medico.';
        this.cargandoHorariosMedico = false;
      }
    });
  }

  generarSlotsMedicoSeleccionado() {
    this.slotsMedicoSeleccionado = [];

    const medicoId = Number(this.nuevaCita.medicoId);

    if (!medicoId || !this.fechaSeleccionada || this.horariosMedicoSeleccionado.length === 0) {
      return;
    }

    const diaSeleccionado = this.obtenerDiaSemanaBackend(this.fechaSeleccionada);
    const duracion = Number(this.nuevaCita.duracionMinutos) || 30;

    const horariosDelDia = this.horariosMedicoSeleccionado.filter((h) => {
      const diaHorario = String(h.diaSemana ?? h.dia_semana ?? '').toUpperCase();
      return diaHorario === diaSeleccionado;
    });

    horariosDelDia.forEach((horario) => {
      const inicioHorario = this.extraerHoraComoMinutos(horario.horaInicio ?? horario.hora_inicio);
      const finHorario = this.extraerHoraComoMinutos(horario.horaFin ?? horario.hora_fin);

      if (inicioHorario === null || finHorario === null) return;

      for (let inicio = inicioHorario; inicio + duracion <= finHorario; inicio += duracion) {
        const fin = inicio + duracion;
        const citaOcupada = this.buscarCitaCruzadaMedico(medicoId, inicio, fin);

        this.slotsMedicoSeleccionado.push({
          horaInicio: this.formatearMinutosHora(inicio),
          horaFin: this.formatearMinutosHora(fin),
          ocupado: !!citaOcupada,
          citaId: citaOcupada ? (citaOcupada.id || citaOcupada.idCita) : null,
          paciente: citaOcupada ? this.getNombrePaciente(citaOcupada.pacienteId || citaOcupada.paciente?.id) : null,
          estado: citaOcupada ? citaOcupada.estado : null
        });
      }
    });

    if (horariosDelDia.length === 0) {
      this.mensajeHorariosMedico = `El medico seleccionado no atiende el dia ${diaSeleccionado}.`;
    } else if (this.slotsMedicoSeleccionado.length === 0) {
      this.mensajeHorariosMedico = 'No hay bloques disponibles para la duracion seleccionada.';
    } else {
      this.mensajeHorariosMedico = '';
    }
  }

  private buscarCitaCruzadaMedico(medicoId: number, inicioSlot: number, finSlot: number): any | null {
    return this.todasLasCitas.find((cita) => {
      const estado = (cita.estado || '').toUpperCase();

      if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') return false;

      const medicoCitaId = Number(cita.medicoId ?? cita.medico?.id ?? cita.idMedico);
      if (medicoCitaId !== Number(medicoId)) return false;

      const fechaCita = new Date(cita.fechaHora || cita.fechaCita || cita.fecha);
      if (Number.isNaN(fechaCita.getTime())) return false;

      if (!this.esMismaFecha(fechaCita, this.fechaSeleccionada)) return false;

      const inicioCita = fechaCita.getHours() * 60 + fechaCita.getMinutes();

      let finCita: number;

      if (cita.fechaFin) {
        const fechaFin = new Date(cita.fechaFin);
        finCita = fechaFin.getHours() * 60 + fechaFin.getMinutes();
      } else {
        finCita = inicioCita + Number(this.nuevaCita.duracionMinutos || 30);
      }

      return inicioSlot < finCita && finSlot > inicioCita;
    }) || null;
  }

  private medicoTieneCitaCruzada(medicoId: number): boolean {
    const inicioNueva = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const finNueva = new Date(
      inicioNueva.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000
    );

    return this.todasLasCitas.some((cita) => {
      const estado = (cita.estado || '').toUpperCase();

      if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') return false;

      const medicoCitaId = Number(cita.medicoId ?? cita.medico?.id ?? cita.idMedico);
      if (medicoCitaId !== Number(medicoId)) return false;

      const inicioExistente = new Date(cita.fechaHora || cita.fechaCita || cita.fecha);
      if (Number.isNaN(inicioExistente.getTime())) return false;

      const finExistente = cita.fechaFin
        ? new Date(cita.fechaFin)
        : new Date(inicioExistente.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000);

      return inicioNueva < finExistente && finNueva > inicioExistente;
    });
  }

  private obtenerConsultorioDisponible(): any | null {
    const sedeId = Number(this.nuevaCita.clinicaId);

    const consultoriosSede = this.consultorios.filter((consultorio) => {
      const clinicaConsultorioId = Number(
        consultorio.clinicaId ??
        consultorio.clinica?.id ??
        consultorio.idClinica
      );

      return clinicaConsultorioId === sedeId;
    });

    if (consultoriosSede.length === 0) {
      return null;
    }

    return consultoriosSede.find((consultorio) => {
      const consultorioId = Number(consultorio.id ?? consultorio.idConsultorio);
      return consultorioId && !this.consultorioTieneCitaCruzada(consultorioId);
    }) || null;
  }

  private consultorioTieneCitaCruzada(consultorioId: number): boolean {
    const inicioNueva = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const finNueva = new Date(
      inicioNueva.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000
    );

    return this.todasLasCitas.some((cita) => {
      const estado = (cita.estado || '').toUpperCase();

      if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') return false;

      const consultorioCitaId = Number(
        cita.consultorioId ??
        cita.consultorio?.id ??
        cita.idConsultorio
      );

      if (!consultorioCitaId || consultorioCitaId !== Number(consultorioId)) {
        return false;
      }

      const inicioExistente = new Date(cita.fechaHora || cita.fechaCita || cita.fecha);
      if (Number.isNaN(inicioExistente.getTime())) return false;

      const finExistente = cita.fechaFin
        ? new Date(cita.fechaFin)
        : new Date(inicioExistente.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000);

      return inicioNueva < finExistente && finNueva > inicioExistente;
    });
  }

  registrarCita() {
    if (
      !this.nuevaCita.pacienteId ||
      !this.nuevaCita.especialidadId ||
      !this.nuevaCita.medicoId ||
      !this.nuevaCita.clinicaId ||
      !this.fechaSeleccionada ||
      !this.horaSeleccionada
    ) {
      this.mostrarAlerta('Por favor, completa los campos obligatorios.', false);
      return;
    }

    const dateInicio = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);

    if (dateInicio <= new Date()) {
      this.mostrarAlerta('La fecha y hora de la cita deben ser en el futuro.', false);
      return;
    }

    const medicoId = Number(this.nuevaCita.medicoId);

    this.validarDisponibilidadMedico(medicoId).subscribe({
      next: (medicoDisponible) => {
        if (!medicoDisponible) {
          this.mostrarAlerta(
            this.mensajeDisponibilidad || 'El medico seleccionado no esta disponible en ese horario.',
            false
          );
          this.actualizarMedicosDisponibles();
          return;
        }

        const consultorioDisponible = this.obtenerConsultorioDisponible();

        if (!consultorioDisponible) {
          this.mostrarAlerta('No hay consultorio disponible en la sede seleccionada para ese horario.', false);
          return;
        }

        const consultorioId = Number(consultorioDisponible.id ?? consultorioDisponible.idConsultorio);
        this.guardarCita(consultorioId);
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('No se pudo validar el horario del medico.', false);
      }
    });
  }

  private guardarCita(consultorioId: number) {
    const dateInicio = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const dateFin = new Date(
      dateInicio.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000
    );

    const motivo = this.nuevaCita.motivoConsulta || 'Consulta medica';

    const payloadCita = {
      pacienteId: Number(this.nuevaCita.pacienteId),
      medicoId: Number(this.nuevaCita.medicoId),
      clinicaId: Number(this.nuevaCita.clinicaId),
      consultorioId: consultorioId,
      fechaHora: this.formatearFechaHoraBackend(dateInicio),
      fechaFin: this.formatearFechaHoraBackend(dateFin),
      motivo: motivo,
      motivoConsulta: motivo,
      notas: '',
      estado: this.nuevaCita.estado
    };

    const headers = this.obtenerHeaders();

    this.http.post(`${this.urlBase}/citas`, payloadCita, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta('Cita medica agendada correctamente.', true);
        this.mostrarFormulario = false;
        this.resetFormulario();
        this.cargarDatosEstructurales();
      },
      error: (err) => {
        console.error('Error al guardar cita:', err.error || err);
        this.mostrarAlerta('No se pudo guardar la cita. Revisa si la sede tiene consultorios registrados.', false);
      }
    });
  }

  cambiarEstadoCita(id: number, nuevoEstado: string) {
    const headers = this.obtenerHeaders();
    const body = { estado: nuevoEstado };

    this.http.patch(`${this.urlBase}/citas/${id}/estado`, body, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta(`Estado actualizado a ${nuevoEstado}.`, true);
        this.cargarDatosEstructurales();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('Error al cambiar el estado. Revisa la consola.', false);
      }
    });
  }

  eliminarCita(id: number) {
    const idCita = Number(id);

    if (!idCita) {
      this.mostrarAlerta('No se pudo identificar la cita a eliminar.', false);
      return;
    }

    const cita = this.todasLasCitas.find((c) => Number(c.id || c.idCita) === idCita);
    const detalle = cita
      ? `#${idCita} - ${this.getNombrePaciente(cita.pacienteId)}`
      : `#${idCita}`;

    if (!confirm(`Estas seguro de eliminar la cita ${detalle}? Esta accion intentara borrarla de la base de datos.`)) {
      return;
    }

    const headers = this.obtenerHeaders();

    this.http.delete(`${this.urlBase}/citas/${idCita}`, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.mostrarAlerta('Cita eliminada correctamente.', true);
        this.cargarDatosEstructurales();
      },
      error: (err) => {
        console.error('Error al eliminar cita:', err);
        this.mostrarAlerta('No se pudo eliminar la cita. Puede tener datos asociados como factura, triage o consulta.', false);
      }
    });
  }

  irAFacturacion(cita?: any) {
    const idCita = cita ? Number(cita.idCita || cita.id) : null;

    if (!idCita) {
      this.router.navigate(['/panel/recepcion/faacturacion']);
      return;
    }

    this.router.navigate(['/panel/recepcion/faacturacion'], {
      queryParams: { citaId: idCita }
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    this.messageService.add({
      severity: esExito ? 'success' : 'error',
      summary: esExito ? 'Operacion exitosa' : 'Error',
      detail: msg,
      life: 5000,
      closable: true
    });
  }

  resetFormulario() {
    this.nuevaCita = {
      pacienteId: '',
      especialidadId: '',
      medicoId: '',
      clinicaId: this.clinicaId ? String(this.clinicaId) : '',
      duracionMinutos: 30,
      fechaHora: '',
      motivoConsulta: '',
      estado: 'PENDIENTE'
    };

    this.filtroPaciente = '';
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.horaMinima = '';
    this.medicosBaseEspecialidad = [];
    this.medicosDisponibles = [];
    this.mensajeDisponibilidad = '';
    this.limpiarAgendaMedico();

    this.actualizarFechaMinima();
    this.pacientesFiltrados = [...this.pacientes];
  }

  private limpiarAgendaMedico() {
    this.horariosMedicoSeleccionado = [];
    this.slotsMedicoSeleccionado = [];
    this.cargandoHorariosMedico = false;
    this.mensajeHorariosMedico = '';
  }

  formatearFechaHora(fechaIso: string): string {
    if (!fechaIso) return 'No registrada';

    return new Date(fechaIso).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  esCitaVencida(fechaIso: string): boolean {
    if (!fechaIso) return false;
    return new Date(fechaIso).getTime() < new Date().getTime();
  }

  esCitaBloqueada(estado: string): boolean {
    return estado === 'COMPLETADA' || estado === 'NO_ASISTIO' || estado === 'FINALIZADA';
  }

  traducirDiaSemana(dia: string): string {
    const dias: Record<string, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miercoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sabado',
      SUNDAY: 'Domingo'
    };

    return dias[String(dia || '').toUpperCase()] || dia;
  }

  private horarioEstaActivo(h: any): boolean {
    if (h.activo === false) return false;
    if (h.activo === 0) return false;
    if (String(h.activo).toLowerCase() === 'false') return false;
    return true;
  }

  private obtenerDiaSemanaBackend(fechaTexto: string): string {
    const fecha = new Date(`${fechaTexto}T00:00:00`);
    const dias = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return dias[fecha.getDay()];
  }

  private extraerHoraComoMinutos(valor: any): number | null {
    if (valor === null || valor === undefined || valor === '') return null;

    if (Array.isArray(valor)) {
      const horas = Number(valor[0]);
      const minutos = Number(valor[1] ?? 0);

      if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null;

      return horas * 60 + minutos;
    }

    if (typeof valor === 'object') {
      const horas = Number(valor.hour ?? valor.hours ?? valor.hora);
      const minutos = Number(valor.minute ?? valor.minutes ?? valor.minuto ?? 0);

      if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null;

      return horas * 60 + minutos;
    }

    const texto = String(valor);
    const match = texto.match(/(\d{1,2}):(\d{2})/);

    if (!match) return null;

    const horas = Number(match[1]);
    const minutos = Number(match[2]);

    if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null;

    return horas * 60 + minutos;
  }

  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private formatearMinutosHora(minutosTotales: number): string {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }

  private esMismaFecha(fecha: Date, fechaTexto: string): boolean {
    const seleccionada = new Date(`${fechaTexto}T00:00:00`);

    return fecha.getFullYear() === seleccionada.getFullYear() &&
      fecha.getMonth() === seleccionada.getMonth() &&
      fecha.getDate() === seleccionada.getDate();
  }

  private ordenDiaSemana(dia: string): number {
    const orden: Record<string, number> = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7
    };

    return orden[String(dia || '').toUpperCase()] ?? 99;
  }

  private formatearFechaInput(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  private formatearFechaHoraBackend(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const hh = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
  }
}