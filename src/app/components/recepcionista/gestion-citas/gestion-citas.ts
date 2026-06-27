import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './gestion-citas.html',
  styleUrl: './gestion-citas.scss',
})
export class GestionCitas implements OnInit {
  // Datos estructurales
  citas: any[] = [];
  medicos: any[] = [];
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  filtroPaciente: string = '';
  cargando: boolean = true;
  mostrarFormulario: boolean = false;

  fechaMinima: string = '';
  horaMinima: string = '';
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
  private messageService = inject(MessageService);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';
  private router = inject(Router);

  ngOnInit() {
    this.actualizarFechaMinima();
    this.cargarDatosEstructurales();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  irAFacturacion() {
    // Redirige usando el typo exacto que dejaste en app.routes.ts
    this.router.navigate(['/panel/recepcion/faacturacion']);
  }

  cargarDatosEstructurales() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    this.http.get<any[]>(`${this.urlBase}/citas`, { headers }).subscribe({
      next: (data) => {
        this.citas = data.sort(
          (a, b) =>
            new Date(b.fechaHora || b.fechaCita).getTime() -
            new Date(a.fechaHora || a.fechaCita).getTime()
        );

        this.http.get<any[]>(`${this.urlBase}/medicos`, { headers }).subscribe(
          meds => (this.medicos = meds)
        );
        this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }).subscribe(pacs => {
          this.pacientes = pacs;
          this.pacientesFiltrados = pacs;
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

  getNombrePaciente(id: number): string {
    const pac = this.pacientes.find(p => p.id === id);
    return pac
      ? `${pac.nombre || pac.usuario?.nombre} ${pac.apellido || pac.usuario?.apellido}`
      : 'Desconocido';
  }

  getNombreMedico(id: number): string {
    const med = this.medicos.find(m => m.id === id);
    return med
      ? `Dr(a). ${med.nombre || med.usuario?.nombre} ${med.apellido || med.usuario?.apellido}`
      : 'No asignado';
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
      const dniStr = (
        p.numeroDocumento || p.dni || p.usuario?.dni || p.usuario?.numeroDocumento || ''
      ).toString();
      return `${nombreStr} ${apellidoStr}`.includes(termino) || dniStr.includes(termino);
    });
  }

  actualizarFechaMinima() {
    const ahora = new Date();
    this.fechaMinima = ahora.toISOString().split('T')[0];
    this.actualizarHoraMinima();
  }

  actualizarHoraMinima() {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];

    if (this.fechaSeleccionada === hoy) {
      const minSiguiente = new Date(ahora.getTime() + 60_000);
      const hh = String(minSiguiente.getHours()).padStart(2, '0');
      const mm = String(minSiguiente.getMinutes()).padStart(2, '0');
      this.horaMinima = `${hh}:${mm}`;
    } else {
      this.horaMinima = '00:00';
    }
  }

  onFechaChange() {
    this.horaSeleccionada = '';
    this.actualizarHoraMinima();
  }

  registrarCita() {
    // 1) Campos obligatorios
    if (
      !this.nuevaCita.pacienteId ||
      !this.nuevaCita.medicoId ||
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

    const dateFin = new Date(dateInicio.getTime() + 30 * 60_000);

    const formatoISO = (d: Date) =>
      `${d.getFullYear()}-` +
      `${String(d.getMonth() + 1).padStart(2, '0')}-` +
      `${String(d.getDate()).padStart(2, '0')}T` +
      `${String(d.getHours()).padStart(2, '0')}:` +
      `${String(d.getMinutes()).padStart(2, '0')}:00`;

    const payloadCita = {
      pacienteId: Number(this.nuevaCita.pacienteId),
      medicoId: Number(this.nuevaCita.medicoId),
      clinicaId: 1,
      consultorioId: 1,
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

    // Usamos el endpoint PATCH enviando solo el nuevo estado
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
    this.http
      .delete(`${this.urlBase}/citas/${id}`, { headers, responseType: 'text' })
      .subscribe({
        next: () => {
          this.mostrarAlerta('Cita removida con éxito.', true);
          this.cargarDatosEstructurales();
        },
        error: (err) => console.error(err)
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
      pacienteId: '', medicoId: '', fechaHora: '',
      motivoConsulta: '', estado: 'PENDIENTE'
    };
    this.filtroPaciente = '';
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.horaMinima = '';
    this.actualizarFechaMinima();
    this.pacientesFiltrados = [...this.pacientes];
  }

  formatearFechaHora(fechaIso: string): string {
    if (!fechaIso) return 'No registrada';
    return new Date(fechaIso).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  esCitaVencida(fechaIso: string): boolean {
    if (!fechaIso) return false;
    return new Date(fechaIso).getTime() < new Date().getTime();
  }

  esCitaBloqueada(estado: string): boolean {
    return estado === 'COMPLETADA' || estado === 'NO_ASISTIO' || estado === 'FINALIZADA';
  }

}