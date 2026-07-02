import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { HorarioService } from '../../../services/horario/horario';
import { UsuarioService } from '../../../services/usuario/usuario';
import { MedicoService } from '../../../services/medico/medico';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class Horarios implements OnInit {
  mostrarModal = signal(false);
  mostrarModalEliminar = signal(false);

  horarioEditandoId = signal<number | null>(null);
  horarioParaEliminar = signal<any | null>(null);

  terminoBusqueda = signal('');
  filtroDia = signal('TODOS');

  usuarioActual = signal<any | null>(null);
  medicos = signal<any[]>([]);
  horarios = signal<any[]>([]);

  private fb = new FormBuilder();

  form = this.fb.group({
    medicoId: [null as number | null, [Validators.required]],
    diaSemana: ['MONDAY', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
    duracionTurnoMinutos: [30, [Validators.required, Validators.min(10)]],
    activo: [true],
  });

  constructor(
    private horarioService: HorarioService,
    private usuarioService: UsuarioService,
    private medicoService: MedicoService,
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
      console.error('No se encontró username en el token.');
      return;
    }

    this.usuarioService.obtenerPorUsername(username).subscribe({
      next: (usuario) => {
        this.usuarioActual.set(usuario);

        if (!usuario.clinicaId) {
          console.error('El usuario no tiene clínica asignada.');
          return;
        }

        this.cargarDatos(usuario.clinicaId);
      },
      error: (err) => console.error('Error al cargar usuario:', err),
    });
  }

  cargarDatos(clinicaId: number): void {
    this.medicoService.obtenerPorClinica(clinicaId).subscribe({
      next: (medicos) => {
        console.log('MEDICOS:', medicos); // <-- Agrega esta línea

        this.medicos.set(medicos);
        this.cargarHorarios(clinicaId);
      },
      error: (err) => console.error('Error al cargar médicos:', err),
    });
  }

  cargarHorarios(clinicaId: number): void {
    this.horarioService.obtenerHorarios().subscribe({
      next: (datos) => {
        const idsMedicosClinica = this.medicos().map((m) => m.id ?? m.idMedico);

        const horariosClinica = datos.filter(
          (h) => h.clinicaId === clinicaId || idsMedicosClinica.includes(h.medicoId),
        );

        this.horarios.set(horariosClinica);
      },
      error: (err) => console.error('Error al cargar horarios:', err),
    });
  }

  horariosFiltrados = computed(() => {
    const texto = this.terminoBusqueda().toLowerCase().trim();
    const dia = this.filtroDia();

    return this.horarios().filter((h) => {
      const medico = this.nombreMedico(h.medicoId, h).toLowerCase();
      const coincideTexto = medico.includes(texto) || h.diaSemana?.toLowerCase().includes(texto);

      const coincideDia = dia === 'TODOS' || h.diaSemana === dia;

      return coincideTexto && coincideDia;
    });
  });

  totalHorarios = computed(() => this.horarios().length);

  horariosActivos = computed(() => this.horarios().filter((h) => h.activo === true).length);

  horariosInactivos = computed(() => this.horarios().filter((h) => h.activo === false).length);

  totalMedicosConHorario = computed(() => {
    const ids = new Set(this.horarios().map((h) => h.medicoId));
    return ids.size;
  });

  nombreMedico(medicoId: number, horario?: any): string {
    if (horario?.medicoNombre || horario?.medicoApellido) {
      return `${horario.medicoNombre ?? ''} ${horario.medicoApellido ?? ''}`.trim();
    }

    const medico = this.medicos().find((m) => (m.id ?? m.idMedico) === medicoId);

    if (!medico) return `Médico ID ${medicoId}`;

    if (medico.nombre && medico.apellido) {
      return `${medico.nombre} ${medico.apellido}`;
    }

    if (medico.usuarioNombre || medico.usuarioApellido) {
      return `${medico.usuarioNombre ?? ''} ${medico.usuarioApellido ?? ''}`.trim();
    }

    return `Médico ID ${medicoId}`;
  }

  nombreDia(dia: string): string {
    const dias: any = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };

    return dias[dia] ?? dia;
  }

  cambiarFiltroDia(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroDia.set(select.value);
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  abrirModal(): void {
    this.horarioEditandoId.set(null);

    this.form.reset({
      medicoId: null,
      diaSemana: 'MONDAY',
      horaInicio: '',
      horaFin: '',
      duracionTurnoMinutos: 30,
      activo: true,
    });

    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.horarioEditandoId.set(null);
    this.mostrarModal.set(false);
  }

  editarHorario(horario: any): void {
    this.horarioEditandoId.set(horario.id);

    this.form.patchValue({
      medicoId: horario.medicoId,
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      duracionTurnoMinutos: horario.duracionTurnoMinutos,
      activo: horario.activo,
    });

    this.mostrarModal.set(true);
  }

  guardarHorario(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuario = this.usuarioActual();

    if (!usuario?.clinicaId) {
      alert('No se encontró la clínica asignada.');
      return;
    }

    const body = {
      id: this.horarioEditandoId(),
      medicoId: this.form.value.medicoId,
      clinicaId: usuario.clinicaId,
      diaSemana: this.form.value.diaSemana,
      horaInicio: this.form.value.horaInicio,
      horaFin: this.form.value.horaFin,
      duracionTurnoMinutos: this.form.value.duracionTurnoMinutos,
      activo: this.form.value.activo,
    };

    const peticion = this.horarioEditandoId()
      ? this.horarioService.actualizarHorario(this.horarioEditandoId()!, body)
      : this.horarioService.crearHorario(body);

    peticion.subscribe({
      next: () => {
        this.horarioEditandoId.set(null);
        this.cerrarModal();
        this.cargarDatos(usuario.clinicaId);
      },
      error: (err) => {
        console.error('Error al guardar horario:', err);
        alert('No se pudo guardar el horario.');
      },
    });
  }

  cambiarEstado(horario: any): void {
    const usuario = this.usuarioActual();

    const body = {
      ...horario,
      activo: !horario.activo,
    };

    this.horarioService.actualizarHorario(horario.id, body).subscribe({
      next: () => {
        if (usuario?.clinicaId) {
          this.cargarDatos(usuario.clinicaId);
        }
      },
      error: (err) => console.error('Error al cambiar estado:', err),
    });
  }

  abrirModalEliminar(horario: any): void {
    this.horarioParaEliminar.set(horario);
    this.mostrarModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.horarioParaEliminar.set(null);
    this.mostrarModalEliminar.set(false);
  }

  confirmarEliminarHorario(): void {
    const horario = this.horarioParaEliminar();
    const usuario = this.usuarioActual();

    if (!horario) return;

    this.horarioService.eliminarHorario(horario.id).subscribe({
      next: () => {
        this.cerrarModalEliminar();

        if (usuario?.clinicaId) {
          this.cargarDatos(usuario.clinicaId);
        }
      },
      error: (err) => {
        console.error('Error al eliminar horario:', err);
        alert('No se pudo eliminar el horario.');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }
}
