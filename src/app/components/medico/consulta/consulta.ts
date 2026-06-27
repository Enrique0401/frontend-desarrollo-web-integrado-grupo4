import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CitaService } from '../../../services/cita/cita';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta.html',
  styleUrl: './consulta.scss'
})
export class Consulta implements OnInit {
  cita = signal<any | null>(null);
  cargando = signal(false);
  guardando = signal(false);

  form!: FormGroup;

  private idCita!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();

    this.idCita = Number(this.route.snapshot.paramMap.get('idCita'));

    if (!this.idCita) {
      console.error('No se encontró el ID de la cita en la ruta.');
      return;
    }

    this.cargarCita();
  }

  crearFormulario(): void {
    this.form = this.fb.group({
      diagnostico: ['', [Validators.required]],
      observaciones: [''],
      tratamiento: [''],
      receta: ['']
    });
  }

  cargarCita(): void {
    this.cargando.set(true);

    this.citaService.obtenerCitaPorId(this.idCita).subscribe({
      next: (cita) => {
        this.cita.set(cita);
        this.cargando.set(false);

        if (cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') {
          this.cambiarEstadoEnAtencion(cita);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar cita:', err);
      }
    });
  }

  cambiarEstadoEnAtencion(cita: any): void {
    const citaActualizada = {
      ...cita,
      estado: 'EN_ATENCION'
    };

    this.citaService.actualizarCita(this.idCita, citaActualizada).subscribe({
      next: (actualizada) => {
        this.cita.set(actualizada);
      },
      error: (err) => {
        console.error('Error al cambiar cita a EN_ATENCION:', err);
      }
    });
  }

  finalizarConsulta(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const citaActual = this.cita();

    if (!citaActual) {
      return;
    }

    this.guardando.set(true);

    const citaActualizada = {
      ...citaActual,
      estado: 'COMPLETADA',
      notas: this.form.value.observaciones || citaActual.notas
    };

    this.citaService.actualizarCita(this.idCita, citaActualizada).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/panel/medico/dashboard']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al finalizar consulta:', err);
        alert('No se pudo finalizar la consulta.');
      }
    });
  }

  volverDashboard(): void {
    this.router.navigate(['/panel/medico/dashboard']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}