import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { UsuarioService } from '../../../services/usuario/usuario';
import { EspecialidadService } from '../../../services/especialidad/especialidad';
import { ClinicaService } from '../../../services/clinica/clinica';
import { MedicoService } from '../../../services/medico/medico';

@Component({
  selector: 'app-agregar-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agregar-personal.html',
  styleUrl: './agregar-personal.scss'
})
export class AgregarPersonal implements OnInit {
  cargando = signal(false);
  exito = signal(false);
  modoEditar = signal(false);

  especialidades = signal<any[]>([]);
  clinicas = signal<any[]>([]);

  form!: FormGroup;

  private idEditar: number | null = null;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private especialidadService: EspecialidadService,
    private clinicaService: ClinicaService,
    private medicoService: MedicoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarClinicas();
    this.cargarEspecialidades();
    this.configurarValidacionRol();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEditar.set(true);
      this.idEditar = Number(id);
      this.cargarUsuario(this.idEditar);
    }
  }

  crearFormulario(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+$')]],
      telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: [''],
      rol: ['MEDICO', [Validators.required]],
      clinicaId: [null, [Validators.required]],
      activo: [true],
      especialidadId: [null],
      numeroColegiatura: ['']
    });
  }

  configurarValidacionRol(): void {
    this.form.get('rol')?.valueChanges.subscribe((rol) => {
      if (rol === 'MEDICO') {
        this.form.get('especialidadId')?.setValidators([Validators.required]);
        this.form.get('numeroColegiatura')?.setValidators([Validators.required]);
      } else {
        this.form.get('especialidadId')?.clearValidators();
        this.form.get('numeroColegiatura')?.clearValidators();

        this.form.patchValue({
          especialidadId: null,
          numeroColegiatura: ''
        });
      }

      this.form.get('especialidadId')?.updateValueAndValidity();
      this.form.get('numeroColegiatura')?.updateValueAndValidity();
    });

    const rolActual = this.form.get('rol')?.value;

    if (rolActual === 'MEDICO') {
      this.form.get('especialidadId')?.setValidators([Validators.required]);
      this.form.get('numeroColegiatura')?.setValidators([Validators.required]);
      this.form.get('especialidadId')?.updateValueAndValidity();
      this.form.get('numeroColegiatura')?.updateValueAndValidity();
    }
  }

  cargarClinicas(): void {
    this.clinicaService.obtenerClinicas().subscribe({
      next: (datos) => this.clinicas.set(datos),
      error: (err) => console.error('Error al cargar clínicas:', err)
    });
  }

  cargarEspecialidades(): void {
    this.especialidadService.obtenerEspecialidades().subscribe({
      next: (datos) => this.especialidades.set(datos),
      error: (err) => console.error('Error al cargar especialidades:', err)
    });
  }

  cargarUsuario(id: number): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        const usuario = usuarios.find((u) => (u.id ?? u.idUsuario) === id);

        if (!usuario) {
          return;
        }

        this.form.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono,
          username: usuario.username,
          password: '',
          rol: usuario.rol,
          clinicaId: usuario.clinicaId,
          activo: usuario.activo
        });
      },
      error: (err) => console.error('Error al cargar usuario:', err)
    });
  }

  esMedico(): boolean {
    return this.form?.get('rol')?.value === 'MEDICO';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.modoEditar() && !this.form.value.password) {
      alert('La contraseña es obligatoria para crear personal.');
      return;
    }

    this.cargando.set(true);

    const usuarioBody: any = {
      username: this.form.value.username,
      password: this.form.value.password || null,
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      correo: this.form.value.correo,
      telefono: this.form.value.telefono,
      rol: this.form.value.rol,
      activo: this.form.value.activo,
      clinicaId: this.form.value.clinicaId
    };

    if (this.modoEditar() && this.idEditar) {
      this.usuarioService.actualizarUsuario(this.idEditar, usuarioBody).subscribe({
        next: () => {
          this.cargando.set(false);
          this.exito.set(true);

          setTimeout(() => {
            this.router.navigate(['/panel/admin-clinica/personal']);
          }, 1000);
        },
        error: (err) => {
          this.cargando.set(false);
          console.error('Error al actualizar personal:', err);
          alert('No se pudo actualizar el personal.');
        }
      });

      return;
    }

    this.usuarioService.crearUsuario(usuarioBody).subscribe({
      next: (usuarioCreado) => {
        if (this.form.value.rol === 'MEDICO') {
          const medicoBody = {
            numeroColegiatura: this.form.value.numeroColegiatura,
            usuarioId: usuarioCreado.id ?? usuarioCreado.idUsuario,
            especialidadId: this.form.value.especialidadId,
            clinicaId: this.form.value.clinicaId,
            activo: this.form.value.activo
          };

          this.medicoService.crearMedico(medicoBody).subscribe({
            next: () => {
              this.cargando.set(false);
              this.exito.set(true);

              setTimeout(() => {
                this.router.navigate(['/panel/admin-clinica/personal']);
              }, 1000);
            },
            error: (err) => {
              this.cargando.set(false);
              console.error('Usuario creado, pero error al crear médico:', err);
              alert('El usuario se creó, pero no se pudo registrar como médico.');
            }
          });

          return;
        }

        this.cargando.set(false);
        this.exito.set(true);

        setTimeout(() => {
          this.router.navigate(['/panel/admin-clinica/personal']);
        }, 1000);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al crear personal:', err);
        alert('No se pudo crear el personal.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/panel/admin-clinica/personal']);
  }

  campoInvalido(campo: string): boolean {
    const c = this.form?.get(campo);
    return !!c && c.invalid && c.touched;
  }
}