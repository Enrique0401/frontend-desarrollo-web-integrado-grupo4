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

  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';

  nuevaCita = {
    pacienteId: '',
    medicoId: '',
    fechaHora: '',
    motivoConsulta: '',
    estado: 'PENDIENTE'
  };

  private http = inject(HttpClient);
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

  // Carga de datos original (estable)
  cargarDatosEstructurales() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    this.http.get<any[]>(`${this.urlBase}/citas`, { headers }).subscribe({
      next: (data) => {
        this.citas = data.sort((a, b) => new Date(b.fechaHora || b.fechaCita).getTime() - new Date(a.fechaHora || a.fechaCita).getTime());

        this.http.get<any[]>(`${this.urlBase}/medicos`, { headers }).subscribe(meds => this.medicos = meds);
        this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }).subscribe(pacs => {
          this.pacientes = pacs;
          this.pacientesFiltrados = pacs;
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

  // 🔥 ESTO RESUELVE LA CULPA DEL BACKEND: Buscamos el nombre localmente usando el ID
  getNombrePaciente(id: number): string {
    const pac = this.pacientes.find(p => p.id === id);
    return pac ? `${pac.nombre || pac.usuario?.nombre} ${pac.apellido || pac.usuario?.apellido}` : 'Desconocido';
  }

  getNombreMedico(id: number): string {
    const med = this.medicos.find(m => m.id === id);
    return med ? `Dr(a). ${med.nombre || med.usuario?.nombre} ${med.apellido || med.usuario?.apellido}` : 'No asignado';
  }

  filtrarPacientes() {
    const termino = this.filtroPaciente.toLowerCase().trim();
    if (!termino) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const nombreStr = (p.nombre || p.usuario?.nombre || '').toLowerCase();
      const apellidoStr = (p.apellido || p.usuario?.apellido || '').toLowerCase();
      const dniStr = (p.numeroDocumento || p.dni || p.usuario?.dni || p.usuario?.numeroDocumento || '').toString();
      return `${nombreStr} ${apellidoStr}`.includes(termino) || dniStr.includes(termino);
    });
  }

  registrarCita() {
    if (!this.nuevaCita.pacienteId || !this.nuevaCita.medicoId || !this.fechaSeleccionada || !this.horaSeleccionada) {
      this.mostrarAlerta('Por favor, completa los campos obligatorios.', false);
      return;
    }

    // Calcular inicio y fin automático
    const dateInicio = new Date(`${this.fechaSeleccionada}T${this.horaSeleccionada}:00`);
    const dateFin = new Date(dateInicio.getTime() + 30 * 60000); // 30 min

    const formatoISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;

    // Armamos los datos obligatorios para que el backend no de error 500 ni 422
    const payloadCita = {
      pacienteId: Number(this.nuevaCita.pacienteId),
      medicoId: Number(this.nuevaCita.medicoId),
      clinicaId: 1,       // Dato faltante para la BD
      consultorioId: 1,   // Dato faltante para la BD
      fechaHora: formatoISO(dateInicio),
      fechaFin: formatoISO(dateFin),
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
        this.mostrarAlerta('Error interno del servidor. Revisa consola.', false);
      }
    });
  }

  cambiarEstadoCita(id: number, nuevoEstado: string) {
    const headers = this.obtenerHeaders();
    const citaExistente = this.citas.find(c => c.id === id || c.idCita === id);
    if (!citaExistente) return;

    const citaActualizada = {
      ...citaExistente,
      estado: nuevoEstado
    };

    // Usamos el identificador correcto según tu backend
    const idReal = citaExistente.idCita || citaExistente.id;

    this.http.put(`${this.urlBase}/citas/${idReal}`, citaActualizada, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta(`Estado actualizado a ${nuevoEstado}.`, true);
        this.cargarDatosEstructurales();
      },
      error: (err) => console.error(err)
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
      error: (err) => console.error(err)
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    esExito ? this.successMensaje = msg : this.errorMensaje = msg;
    setTimeout(() => { this.successMensaje = ''; this.errorMensaje = ''; }, 4000);
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
    return new Date(fechaIso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }

  esCitaVencida(fechaIso: string): boolean {
    if (!fechaIso) return false;
    const fechaCita = new Date(fechaIso).getTime();
    const ahora = new Date().getTime();
    return fechaCita < ahora;
  }

  esCitaBloqueada(estado: string): boolean {
    return estado === 'COMPLETADA' || estado === 'NO_ASISTIO';
  }
}