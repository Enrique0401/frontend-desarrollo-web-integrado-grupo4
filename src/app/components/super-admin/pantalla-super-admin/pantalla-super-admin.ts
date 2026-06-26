import { Component, OnInit, computed, signal } from '@angular/core';
import { ClinicaService } from '../../../services/clinica/clinica';
import { PacienteService } from '../../../services/paciente/paciente';
import { CitaService } from '../../../services/cita/cita';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-pantalla-super-admin',
  standalone: true,
  templateUrl: './pantalla-super-admin.html',
  styleUrl: './pantalla-super-admin.scss'
})
export class PantallaSuperAdmin implements OnInit {
  clinicas = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  citas = signal<any[]>([]);

  private graficoGeneral: Chart | null = null;

  constructor(
    private clinicaService: ClinicaService,
    private pacienteService: PacienteService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.clinicaService.obtenerClinicas().subscribe({
      next: (datos) => {
        this.clinicas.set(datos);
        this.actualizarGraficoGeneral();
      },
      error: (err) => {
        console.error('Error al cargar clínicas:', err);
      }
    });

    this.pacienteService.obtenerPacientes().subscribe({
      next: (datos) => {
        this.pacientes.set(datos);
        this.actualizarGraficoGeneral();
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
      }
    });

    this.citaService.obtenerCitas().subscribe({
      next: (datos) => {
        this.citas.set(datos);
        this.actualizarGraficoGeneral();
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
      }
    });
  }

  totalClinicas = computed(() => this.clinicas().length);

  totalPacientes = computed(() => this.pacientes().length);

  volumenCitas = computed(() => this.citas().length);

  clinicasActivas = computed(() =>
    this.clinicas().filter(c => c.estado === 'ACTIVA').length
  );

  clinicasSuspendidas = computed(() =>
    this.clinicas().filter(c => c.estado === 'SUSPENDIDA').length
  );

  clinicasCanceladas = computed(() =>
    this.clinicas().filter(c => c.estado === 'CANCELADA').length
  );

  citasProgramadas = computed(() =>
    this.citas().filter(c => c.estado === 'PENDIENTE').length
  );

  citasConfirmadas = computed(() =>
    this.citas().filter(c => c.estado === 'CONFIRMADA').length
  );

  citasAtendidas = computed(() =>
    this.citas().filter(c => c.estado === 'COMPLETADA').length
  );

  citasCanceladas = computed(() =>
    this.citas().filter(c => c.estado === 'CANCELADA').length
  );

  ultimasClinicas = computed(() =>
    [...this.clinicas()].reverse().slice(0, 5)
  );

  private actualizarGraficoGeneral(): void {
    setTimeout(() => {
      const canvas = document.getElementById('graficoGeneral') as HTMLCanvasElement;

      if (!canvas) {
        return;
      }

      const datos = [
        this.totalClinicas(),
        this.clinicasActivas(),
        this.clinicasSuspendidas(),
        this.clinicasCanceladas(),
        this.totalPacientes(),
        this.volumenCitas()
      ];

      if (this.graficoGeneral) {
        this.graficoGeneral.data.datasets[0].data = datos;
        this.graficoGeneral.update();
        return;
      }

      this.graficoGeneral = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: [
            'Clínicas',
            'Activas',
            'Suspendidas',
            'Canceladas',
            'Pacientes',
            'Citas'
          ],
          datasets: [
            {
              label: 'Resumen Global',
              data: datos,
              backgroundColor: [
                'rgba(38, 184, 181, 0.75)',
                'rgba(34, 197, 94, 0.75)',
                'rgba(245, 158, 11, 0.75)',
                'rgba(239, 68, 68, 0.75)',
                'rgba(14, 165, 233, 0.75)',
                'rgba(38, 184, 181, 0.45)'
              ],
              borderColor: [
                '#26b8b5',
                '#22c55e',
                '#f59e0b',
                '#ef4444',
                '#0ea5e9',
                '#1f9d9a'
              ],
              borderWidth: 1,
              borderRadius: 12,
              barThickness: 48
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
                font: {
                  size: 13,
                  weight: 'bold'
                }
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
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b',
                font: {
                  weight: 'bold'
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#eef2f7'
              },
              ticks: {
                color: '#64748b',
                precision: 0
              }
            }
          }
        }
      });
    }, 100);
  }
}