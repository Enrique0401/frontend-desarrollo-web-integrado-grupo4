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
  citas: any[] = [];
  medicos: any[] = [];
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  especialidades: any[] = [];
  consultorios: any[] = [];
  horarios: any[] = [];

  medicosBaseEspecialidad: any[] = [];
  medicosDisponibles: any[] = [];

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

  nuevaCita = {
    pacienteId: '',
    especialidadId: '',
    medicoId: '',
    consultorioId: '',
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

  irAFacturacion(cita?: any) {
    const idCita = cita ? Number(cita.idCita || cita.id) : null;

    if (!idCita) {
      this.router.navigate(['/panel/recepcion/facturacion']);
      return;
    }

    this.router.navigate(['/panel/recepcion/facturacion'], {
      queryParams: { citaId: idCita }
    });
  }

  cargarDatosEstructurales() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    this.clinicaId = this.obtenerClinicaIdDesdeToken();

    if (!this.clinicaId) {
      this.mostrarAlerta('No se pudo detectar la clínica del usuario.', false);
      this.cargando = false;
      return;
    }

    forkJoin({
      citas: this.http.get<any[]>(`${this.urlBase}/citas`, { headers }),
      medicos: this.http.get<any[]>(`${this.urlBase}/medicos`, { headers }),
      pacientes: this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }),
      especialidades: this.http.get<any[]>(`${this.urlBase}/especialidades/activas`, { headers }),
      consultorios: this.http.get<any[]>(`${this.urlBase}/consultorios`, { headers }),
      horarios: this.http.get<any[]>(`${this.urlBase}/horarios`, { headers })
    }).subscribe({
      next: ({ citas, medicos, pacientes, especialidades, consultorios, horarios }) => {
        this.citas = this.obtenerArray(citas).sort(
          (a, b) =>
            new Date(b.fechaHora || b.fechaCita || b.fecha || 0).getTime() -
            new Date(a.fechaHora || a.fechaCita || a.fecha || 0).getTime()
        );

        this.medicos = this.obtenerArray(medicos);
        this.pacientes = this.obtenerArray(pacientes);
        this.pacientesFiltrados = [...this.pacientes];
        this.especialidades = this.obtenerArray(especialidades);
        this.horarios = this.obtenerArray(horarios);

        this.consultorios = this.obtenerArray(consultorios).filter((c) => {
          const clinicaConsultorioId = Number(c.clinicaId ?? c.clinica?.id ?? c.idClinica);
          return !clinicaConsultorioId || clinicaConsultorioId === this.clinicaId;
        });

        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.mostrarAlerta('Ocurrió un error al sincronizar con el servidor médico.', false);
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

  onEspecialidadChange() {
    this.nuevaCita.medicoId = '';
    this.medicosBaseEspecialidad = [];
    this.medicosDisponibles = [];
    this.mensajeDisponibilidad = '';

    if (!this.clinicaId || !this.nuevaCita.especialidadId) return;

    const headers = this.obtenerHeaders();

    this.http.get<any[]>(
      `${this.urlBase}/medicos/activos/especialidad-clinica?clinicaId=${this.clinicaId}&especialidadId=${this.nuevaCita.especialidadId}`,
      { headers }
    ).subscribe({
      next: (medicos) => {
        this.medicosBaseEspecialidad = this.obtenerArray(medicos);
        this.actualizarMedicosDisponibles();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('No se pudieron cargar los médicos de la especialidad.', false);
      }
    });
  }

  onFechaChange() {
    this.horaSeleccionada = '';
    this.nuevaCita.medicoId = '';
    this.actualizarHoraMinima();
    this.actualizarMedicosDisponibles();
  }

  onHoraChange() {
    this.nuevaCita.medicoId = '';
    this.actualizarMedicosDisponibles();
  }

  onConsultorioChange() {
    this.nuevaCita.medicoId = '';
    this.actualizarMedicosDisponibles();
  }

  actualizarMedicosDisponibles() {
    this.nuevaCita.medicoId = '';
    this.mensajeDisponibilidad = '';

    if (!this.nuevaCita.especialidadId) {
      this.medicosDisponibles = [];
      return;
    }

    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.medicosDisponibles = [...this.medicosBaseEspecialidad];
      this.mensajeDisponibilidad = 'Selecciona fecha y hora para validar disponibilidad.';
      return;
    }

    if (this.medicosBaseEspecialidad.length === 0) {
      this.medicosDisponibles = [];
      this.mensajeDisponibilidad = 'No hay médicos activos para esa especialidad.';
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
            disponible: this.medicoAtiendeEnHorarios(horarios, diaSemana, false) &&
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

        if (this.medicosDisponibles.length === 0) {
          this.mensajeDisponibilidad = 'No hay médicos disponibles para esa especialidad, fecha y hora.';
        } else {
          this.mensajeDisponibilidad = '';
        }
      },
      error: (err) => {
        console.error(err);
        this.medicosDisponibles = [];
        this.mensajeDisponibilidad = 'No se pudo validar la disponibilidad de los médicos.';
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

        console.log('===== VALIDACION HORARIO =====');
        console.log('Medico:', medicoId);
        console.log('Fecha:', this.fechaSeleccionada);
        console.log('Dia backend:', diaSemana);
        console.log('Hora:', this.horaSeleccionada);
        console.log('Duracion:', this.nuevaCita.duracionMinutos);
        console.log('Horarios encontrados:', horarios);

        const atiende = this.medicoAtiendeEnHorarios(horarios, diaSemana, true);
        const cruzada = this.medicoTieneCitaCruzada(medicoId);

        console.log('Atiende en horario:', atiende);
        console.log('Tiene cita cruzada:', cruzada);

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
        console.error('Error cargando horario del médico:', medicoId, diaSemana, err);
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
    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      return false;
    }

    if (horarios.length === 0) {
      if (actualizarMensaje) {
        this.mensajeDisponibilidad = `El médico no tiene horario activo para ${diaSemana}.`;
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

      if (horarioClinicaId && this.clinicaId && horarioClinicaId !== this.clinicaId) {
        return false;
      }

      return true;
    });

    if (horariosValidos.length === 0) {
      if (actualizarMensaje) {
        this.mensajeDisponibilidad = 'El médico tiene horario registrado, pero no está activo o no pertenece a esta clínica.';
      }
      return false;
    }

    const disponible = horariosValidos.some((h) => {
      const inicioHorario = this.extraerHoraComoMinutos(h.horaInicio ?? h.hora_inicio);
      const finHorario = this.extraerHoraComoMinutos(h.horaFin ?? h.hora_fin);

      console.log('Horario evaluado:', {
        horaInicioOriginal: h.horaInicio ?? h.hora_inicio,
        horaFinOriginal: h.horaFin ?? h.hora_fin,
        inicioHorario,
        finHorario,
        inicioCita,
        finCita
      });

      if (inicioHorario === null || finHorario === null) {
        return false;
      }

      return inicioCita >= inicioHorario && finCita <= finHorario;
    });

    if (!disponible && actualizarMensaje) {
      const resumenHorarios = horariosValidos
        .map((h) => `${h.horaInicio ?? h.hora_inicio} - ${h.horaFin ?? h.hora_fin}`)
        .join(', ');

      this.mensajeDisponibilidad = `El médico atiende ${diaSemana}, pero no en esa hora. Horario: ${resumenHorarios}.`;
    }

    return disponible;
  }

  private horarioEstaActivo(h: any): boolean {
    if (h.activo === false) return false;
    if (h.activo === 0) return false;
    if (String(h.activo).toLowerCase() === 'false') return false;
    return true;
  }

  private medicoTieneCitaCruzada(medicoId: number): boolean {
    const inicioNueva = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const finNueva = new Date(
      inicioNueva.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000
    );

    return this.citas.some((cita) => {
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

  private consultorioTieneCitaCruzada(): boolean {
    const inicioNueva = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const finNueva = new Date(
      inicioNueva.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000
    );

    return this.citas.some((cita) => {
      const estado = (cita.estado || '').toUpperCase();

      if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') return false;

      const consultorioCitaId = Number(
        cita.consultorioId ?? cita.consultorio?.id ?? cita.idConsultorio
      );

      if (consultorioCitaId !== Number(this.nuevaCita.consultorioId)) return false;

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
      !this.nuevaCita.consultorioId ||
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
            this.mensajeDisponibilidad || 'El médico seleccionado no está disponible en ese horario.',
            false
          );
          this.actualizarMedicosDisponibles();
          return;
        }

        if (this.consultorioTieneCitaCruzada()) {
          this.mostrarAlerta('El consultorio seleccionado ya está ocupado en ese horario.', false);
          return;
        }

        this.guardarCita();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('No se pudo validar el horario del médico.', false);
      }
    });
  }

  private guardarCita() {
    const dateInicio = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const dateFin = new Date(
      dateInicio.getTime() + Number(this.nuevaCita.duracionMinutos) * 60_000
    );

    const payloadCita = {
      pacienteId: Number(this.nuevaCita.pacienteId),
      medicoId: Number(this.nuevaCita.medicoId),
      clinicaId: this.clinicaId,
      consultorioId: Number(this.nuevaCita.consultorioId),
      fechaHora: this.formatearFechaHoraBackend(dateInicio),
      fechaFin: this.formatearFechaHoraBackend(dateFin),
      motivo: this.nuevaCita.motivoConsulta || 'Consulta médica',
      notas: '',
      estado: this.nuevaCita.estado
    };

    const headers = this.obtenerHeaders();

    this.http.post(`${this.urlBase}/citas`, payloadCita, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta('Cita médica agendada correctamente.', true);
        this.mostrarFormulario = false;
        this.resetFormulario();
        this.cargarDatosEstructurales();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('Error interno del servidor. Revisa la consola.', false);
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
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) return;

    const headers = this.obtenerHeaders();

    this.http.delete(`${this.urlBase}/citas/${id}`, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.mostrarAlerta('Cita removida con éxito.', true);
        this.cargarDatosEstructurales();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('No se pudo eliminar la cita.', false);
      }
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    this.messageService.add({
      severity: esExito ? 'success' : 'error',
      summary: esExito ? 'Operación exitosa' : 'Error',
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
      consultorioId: '',
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

    this.actualizarFechaMinima();
    this.pacientesFiltrados = [...this.pacientes];
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