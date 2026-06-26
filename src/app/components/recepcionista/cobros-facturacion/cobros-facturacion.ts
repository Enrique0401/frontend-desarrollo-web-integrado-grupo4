import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cobros-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cobros-facturacion.html',
  styleUrl: './cobros-facturacion.scss',
})
export class CobrosFacturacion implements OnInit {
  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  citasDisponibles: any[] = [];
  citasFiltradas: any[] = [];
  pacientes: any[] = [];

  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  successMensaje: string = '';
  errorMensaje: string = '';
  filtroBuscador: string = '';

  nuevaFactura = {
    citaId: '',
    pacienteId: '',
    montoTotal: '',
    metodoPago: 'EFECTIVO',
    estado: 'PENDIENTE' as 'PENDIENTE' | 'PAGADA' | 'ANULADA'
  };

  ngOnInit() {
    this.cargarDatos();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  cargarDatos() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    forkJoin({
      citas: this.http.get<any[]>(`${this.urlBase}/citas`, { headers }),
      pacientes: this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers })
    }).subscribe({
      next: (res) => {
        this.pacientes = res.pacientes;
        this.citasDisponibles = res.citas.filter(c =>
          c.estado !== 'CANCELADA' &&
          c.estado !== 'NO_ASISTIO' &&
          c.estado !== 'PAGADA' &&
          c.estado !== 'COMPLETADA'
        );
        this.citasFiltradas = [...this.citasDisponibles];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error de red:', err);
        this.cargando = false;
        this.mostrarAlerta('Error al sincronizar con la Base de Datos.', false);
      }
    });
  }

  ejecutarFiltro() {
    const termino = this.filtroBuscador.toLowerCase().trim();
    if (!termino) {
      this.citasFiltradas = [...this.citasDisponibles];
      return;
    }

    this.citasFiltradas = this.citasDisponibles.filter(c => {
      const idPaciente = c.pacienteId || c.paciente_id || c.paciente?.id;
      const pac = this.pacientes.find(p => p.id === Number(idPaciente));

      const nombre = pac ? `${pac.nombre || pac.usuario?.nombre || ''} ${pac.apellido || pac.usuario?.apellido || ''}`.toLowerCase() : '';
      const dni = pac ? (pac.numeroDocumento || pac.dni || pac.usuario?.numeroDocumento || pac.usuario?.dni || '').toString().toLowerCase() : '';
      const idCita = (c.id || c.idCita).toString();

      return nombre.includes(termino) || idCita.includes(termino) || dni.includes(termino);
    });
  }

  seleccionarCitaAuto() {
    const cita = this.citasDisponibles.find(c => c.id === Number(this.nuevaFactura.citaId) || c.idCita === Number(this.nuevaFactura.citaId));
    if (cita) {
      this.nuevaFactura.pacienteId = cita.pacienteId || cita.paciente?.id || cita.paciente_id || '';
    }
  }

  abrirFormularioPago(citaId: any) {
    this.nuevaFactura.citaId = citaId;
    this.seleccionarCitaAuto();
    this.mostrarFormulario = true;

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getNombrePaciente(id: any): string {
    if (!id) return 'Desconocido';
    const p = this.pacientes.find(x => x.id === Number(id));
    return p ? `${p.nombre || p.usuario?.nombre || ''} ${p.apellido || p.usuario?.apellido || ''}` : `Paciente #${id}`;
  }

  registrarCobro() {
    if (!this.nuevaFactura.citaId || !this.nuevaFactura.montoTotal) {
      this.mostrarAlerta('Selecciona una cita y digita un monto.', false);
      return;
    }

    const montoNum = Number(this.nuevaFactura.montoTotal);
    if (montoNum <= 0 || (Math.round(montoNum * 100) % 10 !== 0)) {
      this.mostrarAlerta('Monto inválido. Usa múltiplos de 0.10', false);
      return;
    }

    const subtotalCalc = Number(montoNum.toFixed(2));
    const impuestoCalc = Number((subtotalCalc * 0.18).toFixed(2));
    const totalCalc = Number((subtotalCalc + impuestoCalc).toFixed(2));

    const correlativoAuto = `F001-${Math.floor(Math.random() * 90000) + 10000}`;
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const fechaJava = hoy.toISOString().slice(0, 19);

    const payloadFactura = {
      citaId: Number(this.nuevaFactura.citaId),
      pacienteId: Number(this.nuevaFactura.pacienteId),
      clinicaId: 1,
      idCita: Number(this.nuevaFactura.citaId),
      idPaciente: Number(this.nuevaFactura.pacienteId),
      idClinica: 1,
      total: totalCalc,
      subtotal: subtotalCalc,
      impuesto: impuestoCalc,
      fechaEmision: fechaJava,
      fechaPago: fechaJava,
      fechaActualizacion: fechaJava,
      numeroFactura: correlativoAuto,
      metodoPago: this.nuevaFactura.metodoPago,
      estado: this.nuevaFactura.estado
    };

    const headers = this.obtenerHeaders();
    this.http.post(`${this.urlBase}/facturas`, payloadFactura, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta(`¡Factura guardada! Total: S/ ${totalCalc}`, true);
        this.mostrarFormulario = false;

        if (this.nuevaFactura.estado === 'PAGADA') {
          this.marcarCitaComoPagada(Number(this.nuevaFactura.citaId));
        }

        this.nuevaFactura = { citaId: '', pacienteId: '', montoTotal: '', metodoPago: 'EFECTIVO', estado: 'PAGADA' };
        this.filtroBuscador = '';
      },
      error: (err) => {
        console.error('Error al guardar factura:', err);
        this.mostrarAlerta(`Error del servidor.`, false);
      }
    });
  }

  marcarCitaComoPagada(idCita: number) {
    const citaOriginal = this.citasDisponibles.find(c => c.id === idCita || c.idCita === idCita);
    if (!citaOriginal) return;
    const bodyPlano = {
      id: idCita,
      estado: 'PAGADA',
      pacienteId: citaOriginal.pacienteId || citaOriginal.paciente?.id,
      medicoId: citaOriginal.medicoId || citaOriginal.medico?.id,
      clinicaId: citaOriginal.clinicaId || citaOriginal.clinica?.id || 1,
      consultorioId: citaOriginal.consultorioId || citaOriginal.consultorio?.id || 1
    };

    console.log("Enviando objeto plano para evitar error 500:", bodyPlano);

    this.http.put(`${this.urlBase}/citas/${idCita}`, bodyPlano, { headers: this.obtenerHeaders() }).subscribe({
      next: () => this.cargarDatos(),
      error: (e) => {
        console.error('El backend sigue fallando al actualizar la cita:', e);
        this.mostrarAlerta('La factura se guardó, pero la cita no cambió de estado. Verifica el backend.', false);
      }
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    esExito ? this.successMensaje = msg : this.errorMensaje = msg;
    setTimeout(() => { this.successMensaje = ''; this.errorMensaje = ''; }, 5000);
  }
}