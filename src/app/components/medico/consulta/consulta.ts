import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CitaService } from '../../../services/cita/cita';
import { ConsultaService } from '../../../services/consulta/consulta';
import { HistoriaClinicaService } from '../../../services/historia-clinica/historia-clinica';
import { MedicamentoService } from '../../../services/medicamento/medicamento';
import { RecetaService } from '../../../services/receta/receta';
import { DetalleRecetaService } from '../../../services/detalle-receta/detalle-receta';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta.html',
  styleUrl: './consulta.scss',
})
export class Consulta implements OnInit {
  cita = signal<any | null>(null);
  historiaClinica = signal<any | null>(null);

  medicamentos = signal<any[]>([]);
  medicamentosSeleccionados = signal<any[]>([]);

  cargando = signal(false);
  guardando = signal(false);

  mostrarModalHistoria = signal(false);
  mensajeModalHistoria = signal('');

  form!: FormGroup;

  private idCita!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private consultaService: ConsultaService,
    private historiaClinicaService: HistoriaClinicaService,
    private medicamentoService: MedicamentoService,
    private recetaService: RecetaService,
    private detalleRecetaService: DetalleRecetaService,
  ) {}

  ngOnInit(): void {
    this.crearFormulario();

    this.idCita = Number(this.route.snapshot.paramMap.get('idCita'));

    if (!this.idCita) {
      console.error('No se encontró el ID de la cita.');
      return;
    }

    this.cargarCita();
  }

  crearFormulario(): void {
    this.form = this.fb.group({
      anamnesis: ['', [Validators.required]],
      examenFisico: [''],
      diagnostico: ['', [Validators.required]],
      tratamiento: ['', [Validators.required]],
      observaciones: [''],

      presionArterial: ['120/80', [Validators.required]],
      temperatura: [36.5, [Validators.required]],
      frecuenciaCardiaca: [80, [Validators.required]],
      frecuenciaRespiratoria: [18, [Validators.required]],
      peso: [70, [Validators.required]],
      talla: [1.7, [Validators.required]],

      medicamentoId: [null],
      dosis: [''],
      frecuencia: [''],
      duracion: [''],
      instrucciones: [''],
      indicacionesGenerales: ['']
    });
  }

  cargarCita(): void {
    this.cargando.set(true);

    this.citaService.obtenerCitaPorId(this.idCita).subscribe({
      next: (cita) => {
        this.cita.set(cita);

        if (cita.especialidadId) {
          this.cargarMedicamentos(cita.especialidadId);
        }

        const idCita = cita.id ?? cita.idCita ?? cita.id_cita;

        this.consultaService.obtenerPorCita(idCita).subscribe({
          next: (consultaExistente) => {
            this.form.patchValue({
              anamnesis: consultaExistente.anamnesis,
              examenFisico: consultaExistente.examenFisico,
              diagnostico: consultaExistente.diagnostico,
              tratamiento: consultaExistente.tratamiento,
              observaciones: consultaExistente.observaciones,
              presionArterial: consultaExistente.presionArterial,
              temperatura: consultaExistente.temperatura,
              frecuenciaCardiaca: consultaExistente.frecuenciaCardiaca,
              frecuenciaRespiratoria: consultaExistente.frecuenciaRespiratoria,
              peso: consultaExistente.peso,
              talla: consultaExistente.talla,
            });
          },
          error: () => {
            console.log('No hay consulta médica registrada para esta cita.');
          },
        });

        this.historiaClinicaService.obtenerPorPaciente(cita.pacienteId).subscribe({
          next: (historia) => {
            this.historiaClinica.set(historia);
            this.cargando.set(false);
          },
          error: (err) => {
            this.cargando.set(false);
            console.error('Error al obtener historia clínica:', err);
            this.mensajeModalHistoria.set('El paciente no tiene historia clínica registrada.');
            this.mostrarModalHistoria.set(true);
          },
        });
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar cita:', err);
      },
    });
  }

  cargarMedicamentos(especialidadId: number): void {
    this.medicamentoService.obtenerPorEspecialidad(especialidadId).subscribe({
      next: (datos) => this.medicamentos.set(datos),
      error: (err) => console.error('Error al cargar medicamentos:', err)
    });
  }

  agregarMedicamento(): void {
    const medicamentoId = Number(this.form.value.medicamentoId);

    if (!medicamentoId) {
      alert('Seleccione un medicamento.');
      return;
    }

    const medicamento = this.medicamentos().find(
      m => (m.id ?? m.idMedicamento) === medicamentoId
    );

    if (!medicamento) {
      alert('Medicamento no encontrado.');
      return;
    }

    const item = {
      medicamentoId: medicamento.id ?? medicamento.idMedicamento,
      nombreComercial: medicamento.nombreComercial,
      nombreGenerico: medicamento.nombreGenerico,
      presentacion: medicamento.presentacion,
      concentracion: medicamento.concentracion,
      viaAdministracion: medicamento.viaAdministracion,
      dosis: this.form.value.dosis,
      frecuencia: this.form.value.frecuencia,
      duracion: this.form.value.duracion,
      instrucciones: this.form.value.instrucciones
    };

    this.medicamentosSeleccionados.update(lista => [...lista, item]);

    this.form.patchValue({
      medicamentoId: null,
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    });
  }

  quitarMedicamento(index: number): void {
    this.medicamentosSeleccionados.update(lista =>
      lista.filter((_, i) => i !== index)
    );
  }

  finalizarConsulta(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const citaActual = this.cita();
    const historia = this.historiaClinica();

    if (!citaActual || !historia) {
      alert('Faltan datos de la cita o historia clínica.');
      return;
    }

    this.guardando.set(true);

    const idCita = citaActual.id ?? citaActual.idCita ?? citaActual.id_cita;

    const consultaBody = {
      historiaClinicaId: historia.id ?? historia.idHistoriaClinica,
      pacienteId: citaActual.pacienteId,
      medicoId: citaActual.medicoId,
      citaId: idCita,
      clinicaId: citaActual.clinicaId,

      anamnesis: this.form.value.anamnesis,
      examenFisico: this.form.value.examenFisico,
      diagnostico: this.form.value.diagnostico,
      tratamiento: this.form.value.tratamiento,
      observaciones: this.form.value.observaciones,

      presionArterial: this.form.value.presionArterial,
      temperatura: Number(this.form.value.temperatura),
      frecuenciaCardiaca: Number(this.form.value.frecuenciaCardiaca),
      frecuenciaRespiratoria: Number(this.form.value.frecuenciaRespiratoria),
      peso: Number(this.form.value.peso),
      talla: Number(this.form.value.talla),
    };

    this.consultaService.obtenerPorCita(idCita).subscribe({
      next: (consultaExistente) => {
        this.consultaService.actualizarConsulta(consultaExistente.id, consultaBody).subscribe({
          next: (consultaActualizada) => this.guardarRecetaYCompletar(consultaActualizada, citaActual),
          error: (err) => {
            this.guardando.set(false);
            console.error('Error al actualizar consulta:', err);
          },
        });
      },
      error: () => {
        this.consultaService.guardarConsulta(consultaBody).subscribe({
          next: (consultaCreada) => this.guardarRecetaYCompletar(consultaCreada, citaActual),
          error: (err) => {
            this.guardando.set(false);
            console.error('Error al guardar consulta:', err);
          },
        });
      },
    });
  }

  guardarRecetaYCompletar(consulta: any, citaActual: any): void {
    const medicamentos = this.medicamentosSeleccionados();

    if (medicamentos.length === 0) {
      this.completarCita(citaActual);
      return;
    }

    const recetaBody = {
      consultaMedicaId: consulta.id,
      medicoId: citaActual.medicoId,
      pacienteId: citaActual.pacienteId,
      indicaciones: this.form.value.indicacionesGenerales || 'Seguir indicaciones médicas.'
    };

    this.recetaService.crearReceta(recetaBody).subscribe({
      next: (recetaCreada) => {
        let completados = 0;

        medicamentos.forEach((med) => {
          const detalleBody = {
            recetaId: recetaCreada.id,
            medicamentoId: med.medicamentoId,
            dosis: med.dosis,
            frecuencia: med.frecuencia,
            duracion: med.duracion,
            instrucciones: med.instrucciones
          };

          this.detalleRecetaService.crearDetalle(detalleBody).subscribe({
            next: () => {
              completados++;

              if (completados === medicamentos.length) {
                this.completarCita(citaActual);
              }
            },
            error: (err) => {
              this.guardando.set(false);
              console.error('Error al guardar detalle de receta:', err);
              alert('La consulta se guardó, pero hubo error al guardar un medicamento.');
            }
          });
        });
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al crear receta:', err);
        alert('La consulta se guardó, pero no se pudo crear la receta.');
      }
    });
  }

  completarCita(citaActual: any): void {
    const citaActualizada = {
      ...citaActual,
      estado: 'COMPLETADA',
      notas: this.form.value.observaciones || citaActual.notas,
    };

    this.citaService.actualizarCita(this.idCita, citaActualizada).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/panel/medico/agenda']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Consulta guardada, pero error al completar cita:', err);
        alert('La consulta se guardó, pero no se pudo completar la cita.');
      },
    });
  }

  cerrarModalHistoria(): void {
    this.mostrarModalHistoria.set(false);
  }

  volverAgenda(): void {
    this.router.navigate(['/panel/medico/agenda']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}