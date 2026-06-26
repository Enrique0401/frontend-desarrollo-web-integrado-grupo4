import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-citas.html',
  styleUrl: './gestion-citas.scss',
})
export class GestionCitas implements OnInit {
  // Datos estructurales
  citas: any[] = [];
  medicos: any[] = [];
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];

  // Filtro
  filtroPaciente: string = '';

  // Estados de la vista
  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  errorMensaje: string = '';
  successMensaje: string = '';

  // Separamos fecha y hora para el diseño visual
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';

  nuevaCita = {
    pacienteId: '',
    medicoId: '',
    fechaHora: '', // Se combinará antes de enviar
    motivoConsulta: '',
    estado: 'PENDIENTE'
  };

  private http = inject(HttpClient);
  // URL basada en tu consola de errores
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  ngOnInit() {
    this.cargarDatosEstructurales();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  cargarDatosEstructurales() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    // 1. Cargar Citas
    this.http.get<any[]>(`${this.urlBase}/citas`, { headers }).subscribe({
      next: (data) => {
        this.citas = data.sort((a, b) => new Date(b.fechaHora || b.fechaCita).getTime() - new Date(a.fechaHora || a.fechaCita).getTime());

        // 2. Cargar Médicos
        this.http.get<any[]>(`${this.urlBase}/medicos`, { headers }).subscribe({
          next: (meds) => this.medicos = meds,
          error: (err) => console.error(err)
        });

        // 3. Cargar Pacientes
        this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }).subscribe({
          next: (pacs) => {
            this.pacientes = pacs;
            this.pacientesFiltrados = pacs; // Al inicio mostramos todos
          },
          error: (err) => console.error(err)
        });

        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMensaje = 'Ocurrió un error al sincronizar con el servidor médico.';
        this.cargando = false;
      }
    });
  }

  // Filtro en tiempo real a prueba de errores
  filtrarPacientes() {
    const termino = this.filtroPaciente.toLowerCase().trim();
    if (!termino) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    this.pacientesFiltrados = this.pacientes.filter(p => {
      const nombreStr = (p.nombre || p.usuario?.nombre || '').toLowerCase();
      const apellidoStr = (p.apellido || p.usuario?.apellido || '').toLowerCase();
      const nombreCompleto = `${nombreStr} ${apellidoStr}`.trim();
      const dniStr = (p.numeroDocumento || p.dni || p.usuario?.dni || p.usuario?.numeroDocumento || '').toString();

      return nombreCompleto.includes(termino) || dniStr.includes(termino);
    });

    const existeEnFiltro = this.pacientesFiltrados.find(p => p.id == this.nuevaCita.pacienteId);
    if (!existeEnFiltro) {
      this.nuevaCita.pacienteId = '';
    }
  }

  registrarCita() {
    if (!this.nuevaCita.pacienteId || !this.nuevaCita.medicoId || !this.fechaSeleccionada || !this.horaSeleccionada) {
      this.mostrarAlerta('Por favor, completa los campos obligatorios (Paciente, Médico, Fecha y Hora).', false);
      return;
    }

    // Combinamos la fecha y hora seleccionada para el backend
    this.nuevaCita.fechaHora = `${this.fechaSeleccionada}T${this.horaSeleccionada}:00`;

    const headers = this.obtenerHeaders();
    this.http.post(`${this.urlBase}/citas`, this.nuevaCita, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta('Cita médica agendada correctamente.', true);
        this.mostrarFormulario = false;
        this.resetFormulario();
        this.cargarDatosEstructurales();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('No se pudo registrar la cita. Verifica la disponibilidad del horario.', false);
      }
    });
  }

  cambiarEstadoCita(id: number, nuevoEstado: string) {
    const headers = this.obtenerHeaders();
    const citaExistente = this.citas.find(c => c.id === id);
    if (!citaExistente) return;

    const citaActualizada = { ...citaExistente, pacienteId: citaExistente.paciente?.id, medicoId: citaExistente.medico?.id, estado: nuevoEstado };

    this.http.put(`${this.urlBase}/citas/${id}`, citaActualizada, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta(`Estado de la cita actualizado a ${nuevoEstado}.`, true);
        this.cargarDatosEstructurales();
      },
      error: (err) => console.error(err)
    });
  }

  eliminarCita(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta cita?')) return;
    const headers = this.obtenerHeaders();
    this.http.delete(`${this.urlBase}/citas/${id}`, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.mostrarAlerta('Cita removida del sistema con éxito.', true);
        this.cargarDatosEstructurales();
      },
      error: (err) => console.error(err)
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    if (esExito) {
      this.successMensaje = msg;
      setTimeout(() => this.successMensaje = '', 4000);
    } else {
      this.errorMensaje = msg;
      setTimeout(() => this.errorMensaje = '', 4000);
    }
  }

  resetFormulario() {
    this.nuevaCita = { pacienteId: '', medicoId: '', fechaHora: '', motivoConsulta: '', estado: 'PENDIENTE' };
    this.filtroPaciente = '';
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.pacientesFiltrados = [...this.pacientes];
  }

  formatearFechaHora(fechaIso: string): string {
    if (!fechaIso) return 'No registrada';
    const date = new Date(fechaIso);
    return date.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }
}