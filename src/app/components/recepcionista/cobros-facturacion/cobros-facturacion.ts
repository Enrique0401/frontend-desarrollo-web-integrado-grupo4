import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  // Navegación de pestañas internas
  pestanaActiva: 'citas' | 'historial' = 'citas';

  citasDisponibles: any[] = [];
  citasFiltradas: any[] = [];
  pacientes: any[] = [];
  facturas: any[] = [];
  facturasFiltradas: any[] = [];

  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  successMensaje: string = '';
  errorMensaje: string = '';

  filtroBuscador: string = ''; // Filtro para citas
  filtroHistorial: string = ''; // Filtro para facturas

  // Estructura de formulario con detalles dinámicos
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
      pacientes: this.http.get<any[]>(`${this.urlBase}/pacientes`, { headers }),
      facturas: this.http.get<any[]>(`${this.urlBase}/facturas`, { headers })
    }).subscribe({
      next: (res) => {
        this.pacientes = res.pacientes;
        this.facturas = res.facturas;

        // SOLUCIÓN AL DOBLE PAGO: Excluir citas que ya tengan una factura asociada en el sistema
        this.citasDisponibles = res.citas.filter(c =>
          c.estado !== 'CANCELADA' &&
          c.estado !== 'NO_ASISTIO' &&
          !this.facturas.some(f => f.citaId === c.id || f.citaId === c.idCita)
        );

        this.citasFiltradas = [...this.citasDisponibles];
        this.facturasFiltradas = [...this.facturas];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error de sincronización:', err);
        this.cargando = false;
        this.mostrarAlerta('Error al sincronizar datos con el servidor.', false);
      }
    });
  }

  ejecutarFiltroCitas() {
    const termino = this.filtroBuscador.toLowerCase().trim();
    if (!termino) {
      this.citasFiltradas = [...this.citasDisponibles];
      return;
    }
    this.citasFiltradas = this.citasDisponibles.filter(c => {
      const pacId = c.pacienteId || c.paciente?.id;
      const pac = this.pacientes.find(p => p.id === Number(pacId));
      const nombre = pac ? `${pac.nombre || pac.usuario?.nombre || ''} ${pac.apellido || pac.usuario?.apellido || ''}`.toLowerCase() : '';
      const dni = pac ? (pac.numeroDocumento || pac.usuario?.numeroDocumento || '').toString() : '';
      return nombre.includes(termino) || dni.includes(termino) || c.id?.toString().includes(termino);
    });
  }

  ejecutarFiltroHistorial() {
    const termino = this.filtroHistorial.toLowerCase().trim();
    if (!termino) {
      this.facturasFiltradas = [...this.facturas];
      return;
    }
    this.facturasFiltradas = this.facturas.filter(f => {
      const nombrePac = this.getNombrePaciente(f.pacienteId).toLowerCase();
      const numFactura = (f.numeroFactura || '').toLowerCase();
      return nombrePac.includes(termino) || numFactura.includes(termino) || f.estado.toLowerCase().includes(termino);
    });
  }

  abrirFormularioPago(citaId: any) {
    this.nuevaFactura.citaId = citaId;
    const cita = this.citasDisponibles.find(c => c.id === Number(citaId));
    this.nuevaFactura.pacienteId = cita ? (cita.pacienteId || cita.paciente?.id) : '';

    // Inicializar con un detalle por defecto editable
    this.nuevaFactura.detalles = [
      { descripcion: 'Atención Médica General', cantidad: 1, precioUnitario: 50.00, total: 50.00 }
    ];
    this.nuevaFactura.estado = 'PENDIENTE';
    this.nuevaFactura.metodoPago = 'EFECTIVO';

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
    let subtotalAcumulado = 0;
    this.nuevaFactura.detalles.forEach(item => {
      item.total = Number((item.cantidad * item.precioUnitario).toFixed(2));
      subtotalAcumulado += item.total;
    });

    this.nuevaFactura.subtotal = Number(subtotalAcumulado.toFixed(2));
    this.nuevaFactura.impuesto = Number((this.nuevaFactura.subtotal * 0.18).toFixed(2));
    this.nuevaFactura.total = Number((this.nuevaFactura.subtotal + this.nuevaFactura.impuesto).toFixed(2));
  }

  getNombrePaciente(id: any): string {
    if (!id) return 'Desconocido';
    const p = this.pacientes.find(x => x.id === Number(id));
    return p ? `${p.nombre || p.usuario?.nombre || ''} ${p.apellido || p.usuario?.apellido || ''}` : `Paciente #${id}`;
  }

  registrarCobro() {
    this.calcularTotales();

    if (this.nuevaFactura.detalles.some(d => !d.descripcion || d.precioUnitario <= 0)) {
      this.mostrarAlerta('Todos los campos del detalle deben ser válidos y mayores a 0.', false);
      return;
    }

    const correlativoAuto = `F001-${String(Math.floor(Math.random() * 89999999) + 10000000)}`;
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const fechaJava = hoy.toISOString().slice(0, 19);

    const payloadFactura = {
      citaId: Number(this.nuevaFactura.citaId),
      pacienteId: Number(this.nuevaFactura.pacienteId),
      clinicaId: 1,
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
        this.mostrarAlerta(`¡Factura guardada correctamente como ${this.nuevaFactura.estado}!`, true);
        this.mostrarFormulario = false;

        if (this.nuevaFactura.estado === 'PAGADA') {
          this.marcarCitaComoPagada(Number(this.nuevaFactura.citaId));
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

  // MODIFICACIÓN DE ESTADO DESDE EL HISTORIAL (Cambiar de PENDIENTE a PAGADA)
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

    // Aquí estaba el doble /api/api arruinando todo
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
    const bodyPlano = {
      id: idCita,
      estado: 'PAGADA',
      clinicaId: 1,
      consultorioId: 1
    };

    this.http.put(`${this.urlBase}/citas/${idCita}`, bodyPlano, { headers: this.obtenerHeaders() }).subscribe({
      next: () => this.cargarDatos(),
      error: (e) => {
        console.error('Error al actualizar estado de la cita:', e);
        this.cargarDatos(); // Recargar de todas formas las tablas
      }
    });
  }

  mostrarAlerta(msg: string, esExito: boolean) {
    esExito ? this.successMensaje = msg : this.errorMensaje = msg;
    setTimeout(() => { this.successMensaje = ''; this.errorMensaje = ''; }, 4000);
  }
}