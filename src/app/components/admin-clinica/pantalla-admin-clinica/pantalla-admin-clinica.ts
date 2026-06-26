import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UsuarioService } from '../../../services/usuario/usuario';
import { MedicoService } from '../../../services/medico/medico';
import { CitaService } from '../../../services/cita/cita';
import { EspecialidadService } from '../../../services/especialidad/especialidad';

import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-pantalla-admin-clinica',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pantalla-admin-clinica.html',
  styleUrl: './pantalla-admin-clinica.scss'
})
export class PantallaAdminClinica implements OnInit {
  usuarioActual = signal<any | null>(null);
  personal = signal<any[]>([]);
  medicos = signal<any[]>([]);
  citasHoy = signal<any[]>([]);
  especialidades = signal<any[]>([]);
  totalCitas = signal(0);

  private graficoRoles: Chart | null = null;
  private graficoEstado: Chart | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private medicoService: MedicoService,
    private citaService: CitaService,
    private especialidadService: EspecialidadService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarioLogueado();
  }

  obtenerUsernameDesdeToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || null;
    } catch {
      return null;
    }
  }

  cargarUsuarioLogueado(): void {
    const username = this.obtenerUsernameDesdeToken();

    if (!username) {
      console.error('No se encontró username en el token');
      return;
    }

    this.usuarioService.obtenerPorUsername(username).subscribe({
      next: (usuario) => {
        this.usuarioActual.set(usuario);

        if (!usuario.clinicaId) {
          console.error('El usuario no tiene clínica asignada');
          return;
        }

        this.cargarDatosClinica(usuario.clinicaId);
      },
      error: (err) => console.error('Error al cargar usuario:', err)
    });
  }

  cargarDatosClinica(clinicaId: number): void {
    this.usuarioService.obtenerPorClinica(clinicaId).subscribe({
      next: (datos) => {
        this.personal.set(datos);
        this.actualizarGraficos();
      },
      error: (err) => console.error('Error al cargar personal:', err)
    });

    this.medicoService.obtenerPorClinica(clinicaId).subscribe({
      next: (datos) => this.medicos.set(datos),
      error: (err) => console.error('Error al cargar médicos:', err)
    });

    this.citaService.contarPorClinica(clinicaId).subscribe({
      next: (total) => this.totalCitas.set(total),
      error: (err) => console.error('Error al contar citas:', err)
    });

    const hoy = new Date();
    const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
    const fin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();

    this.citaService.obtenerCitasClinicaPorRango(clinicaId, inicio, fin).subscribe({
      next: (datos) => this.citasHoy.set(datos),
      error: (err) => console.error('Error al cargar citas de hoy:', err)
    });

    this.especialidadService.obtenerEspecialidades().subscribe({
      next: (datos) => this.especialidades.set(datos),
      error: (err) => console.error('Error al cargar especialidades:', err)
    });
  }

  totalPersonal = computed(() => this.personal().length);

  totalMedicos = computed(() =>
    this.personal().filter(p => p.rol === 'MEDICO').length
  );

  totalEnfermeras = computed(() =>
    this.personal().filter(p => p.rol === 'ENFERMERA').length
  );

  totalRecepcionistas = computed(() =>
    this.personal().filter(p => p.rol === 'RECEPCIONISTA').length
  );

  totalAdministrativos = computed(() =>
    this.personal().filter(p => p.rol === 'PERSONAL_ADMINISTRATIVO').length
  );

  personalActivo = computed(() =>
    this.personal().filter(p => p.activo === true).length
  );

  personalInactivo = computed(() =>
    this.personal().filter(p => p.activo === false).length
  );

  ultimosTrabajadores = computed(() =>
    [...this.personal()].reverse().slice(0, 5)
  );

  nombreEspecialidad(id: number): string {
    const esp = this.especialidades().find(e => e.id === id || e.idEspecialidad === id);
    return esp ? esp.nombre : 'Sin especialidad';
  }

  especialidadesConMedicos = computed(() =>
    this.especialidades().map(esp => {
      const id = esp.id ?? esp.idEspecialidad;

      return {
        nombre: esp.nombre,
        total: this.medicos().filter(m => m.especialidadId === id).length
      };
    }).filter(e => e.total > 0)
  );

  private actualizarGraficos(): void {
    setTimeout(() => {
      this.crearGraficoRoles();
      this.crearGraficoEstado();
    }, 100);
  }

  private crearGraficoRoles(): void {
    const canvas = document.getElementById('graficoRoles') as HTMLCanvasElement;
    if (!canvas) return;

    const datos = [
      this.totalMedicos(),
      this.totalEnfermeras(),
      this.totalRecepcionistas(),
      this.totalAdministrativos()
    ];

    if (this.graficoRoles) {
      this.graficoRoles.data.datasets[0].data = datos;
      this.graficoRoles.update();
      return;
    }

    this.graficoRoles = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Médicos', 'Enfermeras', 'Recepción', 'Administrativos'],
        datasets: [
          {
            label: 'Personal por rol',
            data: datos,
            backgroundColor: [
              'rgba(59, 130, 246, 0.75)',
              'rgba(34, 197, 94, 0.75)',
              'rgba(245, 158, 11, 0.75)',
              'rgba(100, 116, 139, 0.75)'
            ],
            borderRadius: 12,
            barThickness: 48
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: { backgroundColor: '#1a202c', padding: 12, cornerRadius: 10 }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  private crearGraficoEstado(): void {
    const canvas = document.getElementById('graficoEstado') as HTMLCanvasElement;
    if (!canvas) return;

    const datos = [this.personalActivo(), this.personalInactivo()];

    if (this.graficoEstado) {
      this.graficoEstado.data.datasets[0].data = datos;
      this.graficoEstado.update();
      return;
    }

    this.graficoEstado = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [
          {
            data: datos,
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: '#1a202c',
            padding: 12,
            cornerRadius: 10
          }
        }
      }
    });
  }
}