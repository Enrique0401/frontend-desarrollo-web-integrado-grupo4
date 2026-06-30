import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

interface DetalleItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

@Component({
  selector: 'app-cobros-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cobros-facturacion.html',
  styleUrl: './cobros-facturacion.scss',
})
export class CobrosFacturacion implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';
  private citaIdDesdeRuta: number | null = null;

  pestanaActiva: 'citas' | 'historial' = 'citas';
  citasDisponibles: any[] = [];
  citasFiltradas: any[] = [];
  pacientes: any[] = [];
  facturas: any[] = [];
  facturasFiltradas: any[] = [];
  cargando = true;
  mostrarFormulario = false;
  successMensaje = '';
  errorMensaje = '';
  filtroBuscador = '';
  filtroHistorial = '';

  nuevaFactura = {
    citaId: '',
    pacienteId: '',
    metodoPago: 'EFECTIVO',
    estado: 'PENDIENTE' as 'PENDIENTE' | 'PAGADA' | 'ANULADA',
    subtotal: 0,
    impuesto: 0,
    total: 0,
    detalles: [] as DetalleItem[]
  };

  ngOnInit() {
    const citaIdParam = this.route.snapshot.queryParamMap.get('citaId');
    this.citaIdDesdeRuta = citaIdParam ? Number(citaIdParam) : null;
    this.cargarDatos();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  cargarDatos() {
    this.cargando = true;
    const headers = this.obtenerHeaders();

    forkJoin({
      citas: this.http.get<any[]>(`${this.urlBase}/citas`, { headers }),
      pacientes: this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }),
      facturas: this.http.get<any[]>(`${this.urlBase}/facturas`, { headers })
    }).subscribe({
      next: (res) => {
        const citas = this.obtenerArray(res.citas);
        this.pacientes = this.obtenerArray(res.pacientes);
        this.facturas = this.obtenerArray(res.facturas);

        this.citasDisponibles = citas.filter((cita) => {
          const idCita = this.obtenerCitaId(cita);
          const estado = (cita.estado || '').toUpperCase();

          const yaTieneFactura = this.facturas.some((factura) =>
            Number(factura.citaId ?? factura.cita?.id) === idCita
          );

          return estado !== 'CANCELADA' &&
            estado !== 'NO_ASISTIO' &&
            estado !== 'FINALIZADA' &&
            !yaTieneFactura;
        });

        this.citasFiltradas = [...this.citasDisponibles];
        this.facturasFiltradas = [...this.facturas];
        this.cargando = false;

        this.abrirFacturaDesdeGestionCitas();
      },
      error: (err) => {
        console.error('Error de sincronización:', err);
        this.cargando = false;
        this.mostrarAlerta('Error al sincronizar datos con el servidor.', false);
      }
    });
  }

  private obtenerArray(respuesta: any): any[] {
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta && Array.isArray(respuesta.content)) return respuesta.content;
    if (respuesta && Array.isArray(respuesta.data)) return respuesta.data;
    return [];
  }

  private abrirFacturaDesdeGestionCitas() {
    if (!this.citaIdDesdeRuta) return;

    const idCita = this.citaIdDesdeRuta;

    const facturaExistente = this.facturas.find((factura) =>
      Number(factura.citaId ?? factura.cita?.id) === idCita
    );

    if (facturaExistente) {
      this.pestanaActiva = 'historial';
      this.mostrarFormulario = false;
      this.filtroHistorial = facturaExistente.numeroFactura || String(idCita);
      this.ejecutarFiltroHistorial();
      this.mostrarAlerta('Esta cita ya tiene una factura registrada. Se abrió el historial.', false);
      this.citaIdDesdeRuta = null;
      return;
    }

    const cita = this.citasDisponibles.find((c) => this.obtenerCitaId(c) === idCita);

    if (!cita) {
      this.pestanaActiva = 'citas';
      this.mostrarFormulario = false;
      this.mostrarAlerta('No se encontró una cita pendiente por facturar con ese ID.', false);
      this.citaIdDesdeRuta = null;
      return;
    }

    this.pestanaActiva = 'citas';
    this.filtroBuscador = '';
    this.citasFiltradas = [cita];
    this.abrirFormularioPago(idCita);
    this.citaIdDesdeRuta = null;
  }

  ejecutarFiltroCitas() {
    const termino = this.filtroBuscador.toLowerCase().trim();

    if (!termino) {
      this.citasFiltradas = [...this.citasDisponibles];
      return;
    }

    this.citasFiltradas = this.citasDisponibles.filter((cita) => {
      const pacId = cita.pacienteId || cita.paciente?.id;
      const paciente = this.pacientes.find((p) => Number(p.id) === Number(pacId));

      const nombre = paciente
        ? `${paciente.nombre || paciente.usuario?.nombre || ''} ${paciente.apellido || paciente.usuario?.apellido || ''}`.toLowerCase()
        : '';

      const dni = paciente
        ? (paciente.numeroDocumento || paciente.usuario?.numeroDocumento || '').toString()
        : '';

      return nombre.includes(termino) ||
        dni.includes(termino) ||
        this.obtenerCitaId(cita).toString().includes(termino);
    });
  }

  ejecutarFiltroHistorial() {
    const termino = this.filtroHistorial.toLowerCase().trim();

    if (!termino) {
      this.facturasFiltradas = [...this.facturas];
      return;
    }

    this.facturasFiltradas = this.facturas.filter((factura) => {
      const nombrePac = this.getNombrePaciente(factura.pacienteId).toLowerCase();
      const numFactura = (factura.numeroFactura || '').toLowerCase();
      const estado = (factura.estado || '').toLowerCase();
      const citaId = String(factura.citaId || '');

      return nombrePac.includes(termino) ||
        numFactura.includes(termino) ||
        estado.includes(termino) ||
        citaId.includes(termino);
    });
  }

  abrirFormularioPago(citaId: any) {
    const idCita = Number(citaId);

    const cita = this.citasDisponibles.find((c) => this.obtenerCitaId(c) === idCita);

    if (!cita) {
      this.mostrarAlerta('No se puede iniciar cobro: la cita no está pendiente por facturar.', false);
      return;
    }

    const pacienteId = Number(cita.pacienteId || cita.paciente?.id);

    if (!pacienteId) {
      this.mostrarAlerta('No se encontró el paciente asociado a esta cita.', false);
      return;
    }

    this.nuevaFactura = {
      citaId: String(idCita),
      pacienteId: String(pacienteId),
      metodoPago: 'EFECTIVO',
      estado: 'PENDIENTE',
      subtotal: 0,
      impuesto: 0,
      total: 0,
      detalles: [
        {
          descripcion: cita.motivo || cita.motivoConsulta || 'Atención Médica General',
          cantidad: 1,
          precioUnitario: 50.00,
          total: 50.00
        }
      ]
    };

    this.calcularTotales();
    this.mostrarFormulario = true;

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  agregarItemDetalle() {
    this.nuevaFactura.detalles.push({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      total: 0
    });
  }

  eliminarItemDetalle(index: number) {
    if (this.nuevaFactura.detalles.length > 1) {
      this.nuevaFactura.detalles.splice(index, 1);
      this.calcularTotales();
    }
  }

  calcularTotales() {
    let totalFinalAcumulado = 0;

    this.nuevaFactura.detalles.forEach((item) => {
      item.total = Number((Number(item.cantidad) * Number(item.precioUnitario)).toFixed(2));
      totalFinalAcumulado += item.total;
    });

    this.nuevaFactura.total = Number(totalFinalAcumulado.toFixed(2));
    this.nuevaFactura.subtotal = Number((this.nuevaFactura.total / 1.18).toFixed(2));
    this.nuevaFactura.impuesto = Number((this.nuevaFactura.total - this.nuevaFactura.subtotal).toFixed(2));
  }

  getNombrePaciente(id: any): string {
    if (!id) return 'Desconocido';

    const paciente = this.pacientes.find((p) => Number(p.id) === Number(id));

    return paciente
      ? `${paciente.nombre || paciente.usuario?.nombre || ''} ${paciente.apellido || paciente.usuario?.apellido || ''}`.trim()
      : `Paciente #${id}`;
  }

  registrarCobro() {
    this.calcularTotales();

    const idCita = Number(this.nuevaFactura.citaId);
    const cita = this.citasDisponibles.find((c) => this.obtenerCitaId(c) === idCita);

    if (!cita) {
      this.mostrarAlerta('No se puede registrar la factura porque la cita ya no está disponible.', false);
      return;
    }

    const pacienteIdCita = Number(cita.pacienteId || cita.paciente?.id);

    if (pacienteIdCita !== Number(this.nuevaFactura.pacienteId)) {
      this.mostrarAlerta('La cita seleccionada no corresponde al paciente de esta factura.', false);
      return;
    }

    const yaTieneFactura = this.facturas.some((factura) =>
      Number(factura.citaId ?? factura.cita?.id) === idCita
    );

    if (yaTieneFactura) {
      this.mostrarAlerta('Esta cita ya tiene una factura registrada.', false);
      this.cargarDatos();
      return;
    }

    if (this.nuevaFactura.detalles.some((d) => !d.descripcion || Number(d.precioUnitario) <= 0 || Number(d.cantidad) <= 0)) {
      this.mostrarAlerta('Todos los campos del detalle deben ser válidos y mayores a 0.', false);
      return;
    }

    const correlativoAuto = `F001-${String(Math.floor(Math.random() * 89999999) + 10000000)}`;
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const fechaJava = hoy.toISOString().slice(0, 19);

    const payloadFactura = {
      citaId: idCita,
      pacienteId: Number(this.nuevaFactura.pacienteId),
      clinicaId: Number(cita.clinicaId || cita.clinica?.id || this.obtenerClinicaIdDesdeToken()),
      subtotal: this.nuevaFactura.subtotal,
      impuesto: this.nuevaFactura.impuesto,
      total: this.nuevaFactura.total,
      numeroFactura: correlativoAuto,
      metodoPago: this.nuevaFactura.metodoPago,
      estado: this.nuevaFactura.estado,
      fechaEmision: fechaJava,
      fechaActualizacion: fechaJava,
      fechaPago: this.nuevaFactura.estado === 'PAGADA' ? fechaJava : null,
      detalles: this.nuevaFactura.detalles
    };

    const headers = this.obtenerHeaders();

    this.http.post(`${this.urlBase}/facturas`, payloadFactura, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta(`Factura guardada correctamente como ${this.nuevaFactura.estado}.`, true);
        this.mostrarFormulario = false;

        if (this.nuevaFactura.estado === 'PAGADA') {
          this.marcarCitaComoPagada(idCita);
        } else {
          this.cargarDatos();
        }
      },
      error: (err) => {
        console.error('Error al guardar factura:', err);
        this.mostrarAlerta('Error interno del servidor al procesar la factura.', false);
      }
    });
  }

  marcarComoPagadaDesdeHistorial(factura: any) {
    const headers = this.obtenerHeaders();
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());

    const facturaActualizada = {
      ...factura,
      estado: 'PAGADA',
      fechaPago: hoy.toISOString().slice(0, 19),
      fechaActualizacion: hoy.toISOString().slice(0, 19)
    };

    this.http.put(`${this.urlBase}/facturas/${factura.id}`, facturaActualizada, { headers }).subscribe({
      next: () => {
        this.mostrarAlerta(`Factura ${factura.numeroFactura} marcada como PAGADA.`, true);

        if (factura.citaId) {
          this.marcarCitaComoPagada(factura.citaId);
        } else {
          this.cargarDatos();
        }
      },
      error: (err) => {
        console.error('Error al actualizar factura:', err);
        this.mostrarAlerta('No se pudo actualizar el cobro.', false);
      }
    });
  }

  marcarCitaComoPagada(idCita: number) {
    const body = { estado: 'FINALIZADA' };

    this.http.patch(`${this.urlBase}/citas/${idCita}/estado`, body, { headers: this.obtenerHeaders() }).subscribe({
      next: () => this.cargarDatos(),
      error: (e) => {
        console.error('Error al actualizar estado de la cita a FINALIZADA:', e);
        this.cargarDatos();
      }
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    if (esExito) {
      this.successMensaje = msg;
      this.errorMensaje = '';
    } else {
      this.errorMensaje = msg;
      this.successMensaje = '';
    }

    setTimeout(() => {
      this.successMensaje = '';
      this.errorMensaje = '';
    }, 4000);
  }

  private obtenerCitaId(cita: any): number {
    return Number(cita.id || cita.idCita);
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
}