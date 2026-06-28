import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface CitaApi {
  id: number;
  pacienteId?: number;
  medicoId?: number;
  consultorioId?: number;
  fechaHora?: string;
  fecha?: string;
  estado?: string;
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

  @ViewChild('chartHoyCanvas') chartHoyCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartHistoricoCanvas') chartHistoricoCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMensualCanvas') chartMensualCanvas?: ElementRef<HTMLCanvasElement>;

  cargando = true;
  error = '';

  citas: CitaApi[] = [];

  estadisticasHoy: EstadisticasCitas = this.crearEstadisticas();
  estadisticasHistoricas: EstadisticasCitas = this.crearEstadisticas();

  etiquetasMeses: string[] = [];
  datosMensualesAtendidas: number[] = [];
  datosMensualesCanceladas: number[] = [];

  private vistaLista = false;
  private chartHoy?: Chart;
  private chartHistorico?: Chart;
  private chartMensual?: Chart;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  ngAfterViewInit() {
    this.vistaLista = true;
  }

  ngOnDestroy() {
    this.destruirGraficos();
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

  cargarEstadisticas() {
    this.cargando = true;
    this.error = '';

    this.http.get<any>(`${this.urlBase}/citas`, { headers: this.obtenerHeaders() }).subscribe({
      next: (respuesta) => {
        this.citas = this.extraerArray<CitaApi>(respuesta);

        this.estadisticasHoy = this.calcularEstadisticas(
          this.citas.filter((cita) => this.esDeHoy(cita))
        );

        this.estadisticasHistoricas = this.calcularEstadisticas(this.citas);
        this.procesarHistoricoMensual(this.citas);

        this.cargando = false;

        setTimeout(() => {
          this.renderizarGraficos();
        }, 0);
      },
      error: (err) => {
        console.error('Error al cargar citas', err);
        this.error = 'No se pudieron cargar las estadisticas.';
        this.cargando = false;
      }
    });
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

  private normalizarEstado(estado?: string): string {
    return (estado || 'PENDIENTE').toUpperCase();
  }

  private obtenerFechaCita(cita: CitaApi): Date | null {
    const valorFecha = cita.fechaHora || cita.fecha;

    if (!valorFecha) return null;

    const fecha = new Date(valorFecha);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  private esDeHoy(cita: CitaApi): boolean {
    const fechaCita = this.obtenerFechaCita(cita);
    if (!fechaCita) return false;

    const hoy = new Date();

    return (
      fechaCita.getFullYear() === hoy.getFullYear() &&
      fechaCita.getMonth() === hoy.getMonth() &&
      fechaCita.getDate() === hoy.getDate()
    );
  }

  private procesarHistoricoMensual(citas: CitaApi[]) {
    const meses = new Map<string, { atendidas: number; canceladas: number }>();

    citas.forEach((cita) => {
      const fecha = this.obtenerFechaCita(cita);
      if (!fecha) return;

      const claveMes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const estado = this.normalizarEstado(cita.estado);

      if (!meses.has(claveMes)) {
        meses.set(claveMes, { atendidas: 0, canceladas: 0 });
      }

      const registro = meses.get(claveMes)!;

      if (estado === 'ATENDIDA' || estado === 'FINALIZADA' || estado === 'COMPLETADA') {
        registro.atendidas++;
      }

      if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') {
        registro.canceladas++;
      }
    });

    const claves = Array.from(meses.keys()).sort();

    this.etiquetasMeses = claves.length ? claves : ['Mes actual'];
    this.datosMensualesAtendidas = claves.length ? claves.map((mes) => meses.get(mes)!.atendidas) : [0];
    this.datosMensualesCanceladas = claves.length ? claves.map((mes) => meses.get(mes)!.canceladas) : [0];
  }

  private renderizarGraficos() {
    if (!this.vistaLista || this.cargando) return;

    const canvasHoy = this.chartHoyCanvas?.nativeElement;
    const canvasHistorico = this.chartHistoricoCanvas?.nativeElement;
    const canvasMensual = this.chartMensualCanvas?.nativeElement;

    if (!canvasHoy || !canvasHistorico || !canvasMensual) return;

    this.destruirGraficos();

    this.chartHoy = new Chart(canvasHoy, this.crearConfigDona('Citas de hoy', this.estadisticasHoy));
    this.chartHistorico = new Chart(canvasHistorico, this.crearConfigBarras());
    this.chartMensual = new Chart(canvasMensual, this.crearConfigLinea(canvasMensual));
  }

  private destruirGraficos() {
    this.chartHoy?.destroy();
    this.chartHistorico?.destroy();
    this.chartMensual?.destroy();

    this.chartHoy = undefined;
    this.chartHistorico = undefined;
    this.chartMensual = undefined;
  }

  private crearConfigDona(titulo: string, data: EstadisticasCitas): ChartConfiguration<'doughnut'> {
    const valores = [data.porAtender, data.enAtencion, data.atendidas, data.canceladas];
    const total = valores.reduce((acc, item) => acc + item, 0);

    return {
      type: 'doughnut',
      data: {
        labels: total > 0 ? ['Por atender', 'En atencion', 'Atendidas', 'Canceladas'] : ['Sin citas'],
        datasets: [
          {
            data: total > 0 ? valores : [1],
            backgroundColor: total > 0
              ? ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
              : ['#e2e8f0'],
            borderWidth: 0,
            hoverOffset: total > 0 ? 8 : 0,
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
            }
          },
          title: {
            display: false,
            text: titulo,
          },
          tooltip: {
            enabled: total > 0,
          }
        }
      }
    };
  }

  private crearConfigBarras(): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels: ['Por atender', 'En atencion', 'Atendidas', 'Canceladas'],
        datasets: [
          {
            label: 'Citas historicas',
            data: [
              this.estadisticasHistoricas.porAtender,
              this.estadisticasHistoricas.enAtencion,
              this.estadisticasHistoricas.atendidas,
              this.estadisticasHistoricas.canceladas,
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
            borderRadius: 8,
            maxBarThickness: 54,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            }
          }
        }
      }
    };
  }

  private crearConfigLinea(canvas: HTMLCanvasElement): ChartConfiguration<'line'> {
    const ctx = canvas.getContext('2d');
    const gradienteVerde = ctx?.createLinearGradient(0, 0, 0, 300);
    gradienteVerde?.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradienteVerde?.addColorStop(1, 'rgba(16, 185, 129, 0)');

    const gradienteRojo = ctx?.createLinearGradient(0, 0, 0, 300);
    gradienteRojo?.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
    gradienteRojo?.addColorStop(1, 'rgba(239, 68, 68, 0)');

    return {
      type: 'line',
      data: {
        labels: this.etiquetasMeses,
        datasets: [
          {
            label: 'Atendidas',
            data: this.datosMensualesAtendidas,
            borderColor: '#10b981',
            backgroundColor: gradienteVerde || 'rgba(16, 185, 129, 0.18)',
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2,
            tension: 0.35,
            fill: true,
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
            fill: true,
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
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            }
          }
        }
      }
    };
  }
}