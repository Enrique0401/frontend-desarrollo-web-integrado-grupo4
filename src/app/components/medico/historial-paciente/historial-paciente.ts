import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PacienteService } from '../../../services/paciente/paciente';
import { ConsultaService } from '../../../services/consulta/consulta';

@Component({
  selector: 'app-historial-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-paciente.html',
  styleUrl: './historial-paciente.scss'
})
export class HistorialPaciente implements OnInit {
  pacientes = signal<any[]>([]);
  pacienteSeleccionado = signal<any | null>(null);
  consultas = signal<any[]>([]);
  terminoBusqueda = signal('');

  constructor(
    private pacienteService: PacienteService,
    private consultaService: ConsultaService
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.pacienteService.obtenerPacientes().subscribe({
      next: (datos) => this.pacientes.set(datos),
      error: (err) => console.error('Error al cargar pacientes:', err)
    });
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value.toLowerCase().trim());
  }

  pacientesFiltrados = computed(() => {
    const texto = this.terminoBusqueda();

    return this.pacientes().filter(p => {
      const nombre = `${p.nombre ?? ''} ${p.apellido ?? ''}`.toLowerCase();
      const dni = `${p.dni ?? p.numeroDocumento ?? ''}`.toLowerCase();

      return nombre.includes(texto) || dni.includes(texto);
    });
  });

  seleccionarPaciente(paciente: any): void {
    this.pacienteSeleccionado.set(paciente);

    const pacienteId = paciente.id ?? paciente.idPaciente;

    this.consultaService.obtenerPorPaciente(pacienteId).subscribe({
      next: (datos) => this.consultas.set(datos),
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.consultas.set([]);
      }
    });
  }
}