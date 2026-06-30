import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

interface CitaApi {
  id?: number;
  idCita?: number;
  pacienteId?: number;
  medicoId?: number;
  consultorioId?: number;
  fechaHora?: string;
  fechaFin?: string;
  fecha?: string;
  estado?: string;
}

interface FacturaApi {
  id?: number;
  citaId?: number;
  pacienteId?: number;
  total?: number;
  estado?: string;
  fechaEmision?: string;
  fechaPago?: string;
}

interface EstadisticasCitas {
  total: number;
  porAtender: number;
  enAtencion: number;
  atendidas: number;
  canceladas: number;
}

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-principal.html',
  styleUrl: './panel-principal.scss',
})
export class PanelPrincipal implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  @ViewChild('chartGeneralCanvas') chartGeneralCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEstadosCanvas') chartEstadosCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMensualCanvas') chartMensualCanvas?: ElementRef<HTMLCanvasElement>;

  cargando = true;
  error = '';

  citas: CitaApi[] = [];
  facturas: FacturaApi[] = [];

  estadisticasHoy: EstadisticasCitas = this.crearEstadisticas();
  estadisticasHistoricas: EstadisticasCitas = this.crearEstadisticas();

  pendientesCobro = 0;
  facturasPendientes = 0;
  facturasPagadas = 0;
  ingresosHoy = 0;
  ingresosTotales = 0;

  etiquetasMeses: string[] = [];
  datosMensualesAtendidas: number[] = [];
  datosMensualesCanceladas: number[] = [];
  datosMensualesFacturadas: number[] = [];

  private vistaLista = false;
  private chartGeneral?: Chart;
  private chartEstados?: Chart;
  private chartMensual?: Chart;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  ngAfterViewInit() {
    this.vistaLista = true;
    this.intentarRenderizarGraficos();
  }

  ngOnDestroy() {
    this.destruirGraficos();
  }

  cargarEstadisticas() {
    this.cargando = true;
    this.error = '';

    const headers = this.obtenerHeaders();

    forkJoin({
      citas: this.http.get<any>(`${this.urlBase}/citas`, { headers }),
      facturas: this.http.get<any>(`${this.urlBase}/facturas`, { headers })
    }).subscribe({
      next: ({ citas, facturas }) => {
        this.citas = this.extraerArray<CitaApi>(citas);
        this.facturas = this.extraerArray<FacturaApi>(facturas);

        const citasHoy = this.citas.filter((cita) => this.esDeHoy(this.obtenerFechaCita(cita)));

        this.estadisticasHoy = this.calcularEstadisticas(citasHoy);
        this.estadisticasHistoricas = this.calcularEstadisticas(this.citas);

        this.pendientesCobro = this.calcularPendientesCobro();
        this.facturasPendientes = this.facturas.filter((f) => this.normalizarEstado(f.estado) === 'PENDIENTE').length;
        this.facturasPagadas = this.facturas.filter((f) => this.normalizarEstado(f.estado) === 'PAGADA').length;

        this.ingresosHoy = this.facturas
          .filter((f) => this.normalizarEstado(f.estado) === 'PAGADA' && this.esDeHoy(this.obtenerFechaFactura(f)))
          .reduce((acc, f) => acc + Number(f.total || 0), 0);

        this.ingresosTotales = this.facturas
          .filter((f) => this.normalizarEstado(f.estado) === 'PAGADA')
          .reduce((acc, f) => acc + Number(f.total || 0), 0);

        this.procesarHistoricoMensual();

        this.cargando = false;
        this.intentarRenderizarGraficos();
      },
      error: (err) => {
        console.error('Error al cargar dashboard de recepción', err);
        this.error = 'No se pudieron cargar las estadísticas del dashboard.';
        this.cargando = false;
      }
    });
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private crearEstadisticas(): EstadisticasCitas {
    return {
      total: 0,
      porAtender: 0,
      enAtencion: 0,
      atendidas: 0,
      canceladas: 0,
    };
  }

  private extraerArray<T>(respuesta: any): T[] {
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta?.content && Array.isArray(respuesta.content)) return respuesta.content;
    if (respuesta?.data && Array.isArray(respuesta.data)) return respuesta.data;
    return [];
  }

  private calcularEstadisticas(citas: CitaApi[]): EstadisticasCitas {
    const estadisticas = this.crearEstadisticas();
    estadisticas.total = citas.length;

    citas.forEach((cita) => {
      const estado = this.normalizarEstado(cita.estado);

      if (estado === 'PENDIENTE' || estado === 'CONFIRMADA') {
        estadisticas.porAtender++;
      } else if (estado === 'EN_ATENCION') {
        estadisticas.enAtencion++;
      } else if (estado === 'ATENDIDA' || estado === 'FINALIZADA' || estado === 'COMPLETADA') {
        estadisticas.atendidas++;
      } else if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') {
        estadisticas.canceladas++;
      }
    });

    return estadisticas;
  }

  private calcularPendientesCobro(): number {
    return this.citas.filter((cita) => {
      const estado = this.normalizarEstado(cita.estado);
      const citaId = this.obtenerCitaId(cita);

      const yaTieneFactura = this.facturas.some((factura) =>
        Number(factura.citaId) === citaId
      );

      return estado === 'ATENDIDA' && !yaTieneFactura;
    }).length;
  }

  private normalizarEstado(estado?: string): string {
    return (estado || 'PENDIENTE').toUpperCase();
  }

  private obtenerCitaId(cita: CitaApi): number {
    return Number(cita.id || cita.idCita || 0);
  }

  private obtenerFechaCita(cita: CitaApi): Date | null {
    const valorFecha = cita.fechaHora || cita.fecha;
    return this.convertirFecha(valorFecha);
  }

  private obtenerFechaFactura(factura: FacturaApi): Date | null {
    return this.convertirFecha(factura.fechaPago || factura.fechaEmision);
  }

  private convertirFecha(valor?: string): Date | null {
    if (!valor) return null;

    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  private esDeHoy(fecha: Date | null): boolean {
    if (!fecha) return false;

    const hoy = new Date();

    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  }

  private procesarHistoricoMensual() {
    const meses = new Map<string, { atendidas: number; canceladas: number; facturadas: number }>();

    this.citas.forEach((cita) => {
      const fecha = this.obtenerFechaCita(cita);
      if (!fecha) return;

      const claveMes = this.obtenerClaveMes(fecha);
      const estado = this.normalizarEstado(cita.estado);

      if (!meses.has(claveMes)) {
        meses.set(claveMes, { atendidas: 0, canceladas: 0, facturadas: 0 });
      }

      const registro = meses.get(claveMes)!;

      if (estado === 'ATENDIDA' || estado === 'FINALIZADA' || estado === 'COMPLETADA') {
        registro.atendidas++;
      }

      if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') {
        registro.canceladas++;
      }
    });

    this.facturas.forEach((factura) => {
      if (this.normalizarEstado(factura.estado) !== 'PAGADA') return;

      const fecha = this.obtenerFechaFactura(factura);
      if (!fecha) return;

      const claveMes = this.obtenerClaveMes(fecha);

      if (!meses.has(claveMes)) {
        meses.set(claveMes, { atendidas: 0, canceladas: 0, facturadas: 0 });
      }

      meses.get(claveMes)!.facturadas++;
    });

    const claves = Array.from(meses.keys()).sort();

    this.etiquetasMeses = claves.length ? claves : ['Mes actual'];
    this.datosMensualesAtendidas = claves.length ? claves.map((mes) => meses.get(mes)!.atendidas) : [0];
    this.datosMensualesCanceladas = claves.length ? claves.map((mes) => meses.get(mes)!.canceladas) : [0];
    this.datosMensualesFacturadas = claves.length ? claves.map((mes) => meses.get(mes)!.facturadas) : [0];
  }

  private obtenerClaveMes(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  private intentarRenderizarGraficos() {
    setTimeout(() => {
      this.renderizarGraficos();
    }, 80);
  }

  private renderizarGraficos() {
    if (!this.vistaLista || this.cargando) return;

    const canvasGeneral = this.chartGeneralCanvas?.nativeElement;
    const canvasEstados = this.chartEstadosCanvas?.nativeElement;
    const canvasMensual = this.chartMensualCanvas?.nativeElement;

    if (!canvasGeneral || !canvasEstados || !canvasMensual) return;

    this.destruirGraficos();

    this.chartGeneral = new Chart(canvasGeneral, this.crearConfigGeneral());
    this.chartEstados = new Chart(canvasEstados, this.crearConfigEstados());
    this.chartMensual = new Chart(canvasMensual, this.crearConfigMensual(canvasMensual));
  }

  private destruirGraficos() {
    this.chartGeneral?.destroy();
    this.chartEstados?.destroy();
    this.chartMensual?.destroy();

    this.chartGeneral = undefined;
    this.chartEstados = undefined;
    this.chartMensual = undefined;
  }

  private crearConfigGeneral(): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels: ['Citas hoy', 'Por atender', 'En atención', 'Atendidas', 'Pend. cobro', 'Fact. pendientes'],
        datasets: [
          {
            label: 'Resumen de recepción',
            data: [
              this.estadisticasHoy.total,
              this.estadisticasHoy.porAtender,
              this.estadisticasHoy.enAtencion,
              this.estadisticasHoy.atendidas,
              this.pendientesCobro,
              this.facturasPendientes
            ],
            backgroundColor: [
              'rgba(38, 184, 181, 0.75)',
              'rgba(245, 158, 11, 0.75)',
              'rgba(59, 130, 246, 0.75)',
              'rgba(34, 197, 94, 0.75)',
              'rgba(168, 85, 247, 0.75)',
              'rgba(239, 68, 68, 0.70)'
            ],
            borderColor: ['#26b8b5', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'],
            borderWidth: 1,
            borderRadius: 12,
            barThickness: 44
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#334155',
              font: { size: 13, weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: '#1a202c',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            cornerRadius: 10
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { weight: 'bold' }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#eef2f7' },
            ticks: {
              color: '#64748b',
              precision: 0
            }
          }
        }
      }
    };
  }

  private crearConfigEstados(): ChartConfiguration<'doughnut'> {
    const valores = [
      this.estadisticasHistoricas.porAtender,
      this.estadisticasHistoricas.enAtencion,
      this.estadisticasHistoricas.atendidas,
      this.estadisticasHistoricas.canceladas
    ];

    const total = valores.reduce((acc, valor) => acc + valor, 0);

    return {
      type: 'doughnut',
      data: {
        labels: total > 0 ? ['Por atender', 'En atención', 'Atendidas', 'Canceladas'] : ['Sin citas'],
        datasets: [
          {
            data: total > 0 ? valores : [1],
            backgroundColor: total > 0
              ? ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444']
              : ['#e2e8f0'],
            borderWidth: 0,
            hoverOffset: total > 0 ? 8 : 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 18,
              color: '#334155',
              font: { weight: 'bold' }
            }
          },
          tooltip: {
            enabled: total > 0,
            backgroundColor: '#1a202c',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            cornerRadius: 10
          }
        }
      }
    };
  }

  private crearConfigMensual(canvas: HTMLCanvasElement): ChartConfiguration<'line'> {
    const ctx = canvas.getContext('2d');

    const gradienteVerde = ctx?.createLinearGradient(0, 0, 0, 320);
    gradienteVerde?.addColorStop(0, 'rgba(34, 197, 94, 0.32)');
    gradienteVerde?.addColorStop(1, 'rgba(34, 197, 94, 0)');

    const gradienteRojo = ctx?.createLinearGradient(0, 0, 0, 320);
    gradienteRojo?.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    gradienteRojo?.addColorStop(1, 'rgba(239, 68, 68, 0)');

    const gradienteTeal = ctx?.createLinearGradient(0, 0, 0, 320);
    gradienteTeal?.addColorStop(0, 'rgba(38, 184, 181, 0.28)');
    gradienteTeal?.addColorStop(1, 'rgba(38, 184, 181, 0)');

    return {
      type: 'line',
      data: {
        labels: this.etiquetasMeses,
        datasets: [
          {
            label: 'Atendidas',
            data: this.datosMensualesAtendidas,
            borderColor: '#22c55e',
            backgroundColor: gradienteVerde || 'rgba(34, 197, 94, 0.18)',
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#22c55e',
            pointBorderWidth: 2,
            tension: 0.35,
            fill: true
          },
          {
            label: 'Canceladas',
            data: this.datosMensualesCanceladas,
            borderColor: '#ef4444',
            backgroundColor: gradienteRojo || 'rgba(239, 68, 68, 0.14)',
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#ef4444',
            pointBorderWidth: 2,
            tension: 0.35,
            fill: true
          },
          {
            label: 'Facturas pagadas',
            data: this.datosMensualesFacturadas,
            borderColor: '#26b8b5',
            backgroundColor: gradienteTeal || 'rgba(38, 184, 181, 0.14)',
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#26b8b5',
            pointBorderWidth: 2,
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              color: '#334155',
              font: { weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: '#1a202c',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            cornerRadius: 10
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#eef2f7' },
            ticks: {
              precision: 0,
              color: '#64748b'
            }
          }
        }
      }
    };
  }
}