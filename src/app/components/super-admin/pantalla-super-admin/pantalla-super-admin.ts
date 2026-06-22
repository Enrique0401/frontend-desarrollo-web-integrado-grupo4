import { Component, OnInit, computed, signal } from '@angular/core';
import { ClinicaService } from '../../../services/clinica/clinica';
import { PacienteService } from '../../../services/paciente/paciente';
import { CitaService } from '../../../services/cita/cita';

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

  constructor(
    private clinicaService: ClinicaService,
    private pacienteService: PacienteService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {

    // Clínicas
    this.clinicaService.obtenerClinicas().subscribe({
      next: (datos) => {
        this.clinicas.set(datos);
      },
      error: (err) => {
        console.error('Error al cargar clínicas:', err);
      }
    });

    // Pacientes
    this.pacienteService.obtenerPacientes().subscribe({
      next: (datos) => {
        this.pacientes.set(datos);
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
      }
    });

    // Citas
    this.citaService.obtenerCitas().subscribe({
      next: (datos) => {
        this.citas.set(datos);
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
      }
    });

  }

  // ==========================
  // MÉTRICAS
  // ==========================

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

  ultimasClinicas = computed(() =>
    [...this.clinicas()].reverse().slice(0, 5)
  );

}