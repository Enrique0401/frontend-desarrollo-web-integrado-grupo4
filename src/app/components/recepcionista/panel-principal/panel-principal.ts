import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables); 

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-principal.html',
  styleUrl: './panel-principal.scss',
})
export class PanelPrincipal implements OnInit {
  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  estadisticasHoy = { pendientes: 0, atencion: 0, finalizadas: 0, canceladas: 0 };
  estadisticasGeneral = { pendientes: 0, atencion: 0, finalizadas: 0, canceladas: 0 };

  etiquetasMeses: string[] = [];
  datosLineaFinalizadas: number[] = [];
  datosLineaCanceladas: number[] = [];

  chartHoy: any;
  chartGeneral: any;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', 'Bearer ' + token);
    return headers;
  }

  cargarEstadisticas() {
    const headers = this.obtenerHeaders();
    const self = this; 

    this.http.get<any>(this.urlBase + '/citas', { headers }).subscribe({
      next: function(respuesta) {
        let citas = [];
        if (Array.isArray(respuesta)) {
            citas = respuesta;
        } else if (respuesta && Array.isArray(respuesta.content)) {
            citas = respuesta.content;
        } else if (respuesta && Array.isArray(respuesta.data)) {
            citas = respuesta.data;
        }

        const hoy = new Date();
        const diaStr = String(hoy.getDate()).padStart(2, '0');
        const mesStr = String(hoy.getMonth() + 1).padStart(2, '0');
        const anioStr = String(hoy.getFullYear());

        let pGen = 0, aGen = 0, fGen = 0, cGen = 0;
        let pHoy = 0, aHoy = 0, fHoy = 0, cHoy = 0;

        for(let i = 0; i < citas.length; i++) {
            const c = citas[i];
            
            // Si el estado viene nulo, el sistema asume de frente que es PENDIENTE
            const estado = (c.estado || 'PENDIENTE').toUpperCase();
            
            // TRUCO PARA DOMAR A SPRING BOOT: Procesamos la fecha venga en el formato que venga
            let fechaCitaStr = '';
            if (Array.isArray(c.fecha)) {
                // Si Spring Boot lo mandó como Array [YYYY, MM, DD]
                fechaCitaStr = c.fecha[0] + '-' + String(c.fecha[1]).padStart(2, '0') + '-' + String(c.fecha[2]).padStart(2, '0');
            } else if (typeof c.fecha === 'number') {
                // Si lo mandó como Timestamp
                fechaCitaStr = new Date(c.fecha).toISOString().split('T')[0];
            } else {
                // Si lo mandó como String, reemplazamos barras por guiones por si acaso
                fechaCitaStr = String(c.fecha || '').replace(/\//g, '-');
            }

            // Suma Histórica (Esta nunca falla porque no depende de la fecha)
            if (estado === 'PENDIENTE' || estado === 'CONFIRMADA') pGen++;
            else if (estado === 'EN_ATENCION') aGen++;
            else if (estado === 'FINALIZADA') fGen++;
            else if (estado === 'CANCELADA') cGen++;

            // Suma de Hoy: Solo si el string final contiene el año, mes y día actual
            if (fechaCitaStr.indexOf(anioStr) !== -1 && fechaCitaStr.indexOf(mesStr) !== -1 && fechaCitaStr.indexOf(diaStr) !== -1) {
                if (estado === 'PENDIENTE' || estado === 'CONFIRMADA') pHoy++;
                else if (estado === 'EN_ATENCION') aHoy++;
                else if (estado === 'FINALIZADA') fHoy++;
                else if (estado === 'CANCELADA') cHoy++;
            }
        }

        self.estadisticasGeneral.pendientes = pGen;
        self.estadisticasGeneral.atencion = aGen;
        self.estadisticasGeneral.finalizadas = fGen;
        self.estadisticasGeneral.canceladas = cGen;

        self.estadisticasHoy.pendientes = pHoy;
        self.estadisticasHoy.atencion = aHoy;
        self.estadisticasHoy.finalizadas = fHoy;
        self.estadisticasHoy.canceladas = cHoy;

        self.procesarHistoricoLineas(citas);

        setTimeout(function() {
            self.renderizarGraficos();
        }, 200);
      },
      error: function(err) {
        console.error("Error al cargar datos", err);
      }
    });
  }

  procesarHistoricoLineas(citas: any[]) {
      const agrupado: any = {};
      
      for(let i = 0; i < citas.length; i++) {
          const c = citas[i];
          const estado = (c.estado || '').toUpperCase();
          const fechaCita = c.fecha || '';
          let mesClave = 'Mes Actual';

          if (fechaCita.length >= 7) {
              if (fechaCita.indexOf('-') === 4) {
                  mesClave = fechaCita.substring(0, 7);
              } else if (fechaCita.indexOf('/') === 2) {
                  mesClave = fechaCita.substring(6, 10) + '-' + fechaCita.substring(3, 5);
              }
          }

          if (!agrupado[mesClave]) {
              agrupado[mesClave] = { finalizadas: 0, canceladas: 0 };
          }

          if (estado === 'FINALIZADA') agrupado[mesClave].finalizadas++;
          if (estado === 'CANCELADA') agrupado[mesClave].canceladas++;
      }

      const clavesOrdenadas = Object.keys(agrupado).sort();
      this.etiquetasMeses = clavesOrdenadas;
      
      const arrFin = [];
      const arrCan = [];
      for(let i = 0; i < clavesOrdenadas.length; i++) {
          arrFin.push(agrupado[clavesOrdenadas[i]].finalizadas);
          arrCan.push(agrupado[clavesOrdenadas[i]].canceladas);
      }
      this.datosLineaFinalizadas = arrFin;
      this.datosLineaCanceladas = arrCan;
  }

  renderizarGraficos() {
    const canvasHoy = document.getElementById('chartHoyCanvas') as HTMLCanvasElement;
    const canvasGeneral = document.getElementById('chartGeneralCanvas') as HTMLCanvasElement;

    if (!canvasHoy || !canvasGeneral) return;

    if (this.chartHoy) this.chartHoy.destroy();
    if (this.chartGeneral) this.chartGeneral.destroy();

    const totalHoy = this.estadisticasHoy.pendientes + this.estadisticasHoy.atencion + this.estadisticasHoy.finalizadas + this.estadisticasHoy.canceladas;
    
    // TRAMPA 1: Si no hay datos, forzamos un valor ficticio gris para que se vea el anillo
    const datosDona = totalHoy > 0 
        ? [this.estadisticasHoy.pendientes, this.estadisticasHoy.atencion, this.estadisticasHoy.finalizadas, this.estadisticasHoy.canceladas] 
        : [1];
    const coloresDona = totalHoy > 0 
        ? ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'] 
        : ['#e2e8f0'];
    const etiquetasDona = totalHoy > 0 
        ? ['Por Atender', 'En Sala', 'Cobradas', 'Canceladas'] 
        : ['Sin citas registradas hoy'];

    const ctxHoy = canvasHoy.getContext('2d');
    if (ctxHoy) {
        this.chartHoy = new Chart(ctxHoy, {
          type: 'doughnut',
          data: {
            labels: etiquetasDona,
            datasets: [{
              data: datosDona,
              backgroundColor: coloresDona,
              borderWidth: 0,
              hoverOffset: totalHoy > 0 ? 8 : 0
            }]
          },
          options: { 
            responsive: true, maintainAspectRatio: false, cutout: '80%',
            plugins: { 
                legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } },
                tooltip: { enabled: totalHoy > 0 } // Apagamos el tooltip si es el anillo gris
            }
          }
        });
    }

    // TRAMPA 2: Si el historial solo tiene un mes, metemos un punto cero para forzar la curva
    let labelsLinea = this.etiquetasMeses.length > 0 ? this.etiquetasMeses : ['Mes Actual'];
    let dataFin = this.datosLineaFinalizadas.length > 0 ? this.datosLineaFinalizadas : [0];
    let dataCan = this.datosLineaCanceladas.length > 0 ? this.datosLineaCanceladas : [0];

    if (labelsLinea.length === 1) {
        labelsLinea.unshift('Inicio'); 
        dataFin.unshift(0);
        dataCan.unshift(0);
    }

    const ctxGeneral = canvasGeneral.getContext('2d');
    if (ctxGeneral) {
        const gradienteVerde = ctxGeneral.createLinearGradient(0, 0, 0, 350);
        gradienteVerde.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradienteVerde.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        const gradienteRojo = ctxGeneral.createLinearGradient(0, 0, 0, 350);
        gradienteRojo.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        gradienteRojo.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

        this.chartGeneral = new Chart(ctxGeneral, {
          type: 'line',
          data: {
            labels: labelsLinea,
            datasets: [
                {
                  label: 'Ingresos Efectivos',
                  data: dataFin,
                  borderColor: '#10b981', backgroundColor: gradienteVerde,
                  borderWidth: 3, pointBackgroundColor: '#ffffff', pointBorderColor: '#10b981',
                  pointBorderWidth: 2, pointRadius: 4, tension: 0.4, fill: true
                },
                {
                  label: 'Pérdidas de Caja',
                  data: dataCan,
                  borderColor: '#ef4444', backgroundColor: gradienteRojo,
                  borderWidth: 3, pointBackgroundColor: '#ffffff', pointBorderColor: '#ef4444',
                  pointBorderWidth: 2, pointRadius: 4, tension: 0.4, fill: true
                }
            ]
          },
          options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } },
            scales: { 
                x: { grid: { display: false } },
                y: { beginAtZero: true, border: { display: false }, ticks: { stepSize: 1, precision: 0 } } 
            }
          }
        });
    }
  }
}