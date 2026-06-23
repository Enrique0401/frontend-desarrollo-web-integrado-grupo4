import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario/usuario';
import { ClinicaService } from '../../../services/clinica/clinica';

@Component({
  selector: 'app-administradores',
  standalone: true,
  imports: [DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './administradores.html',
  styleUrl: './administradores.scss'
})
export class Administradores implements OnInit {
  administradores = signal<any[]>([]);
  clinicas = signal<any[]>([]);
  terminoBusqueda = signal('');

  mostrarModal = signal(false);
  modoEditar = signal(false);
  adminEditando = signal<any | null>(null);
  cargando = signal(false);

  mostrarModalRol = signal(false);
  adminParaRol = signal<any | null>(null);
  rolNuevoSeleccionado = signal<string>('');

  private fb = new FormBuilder();

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: [''],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+$')]],
    telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
    clinicaId: [null as number | null, [Validators.required]],
    rol: ['ADMIN_CLINICA', [Validators.required]],
    activo: [true]
  });

  administradoresFiltrados = computed(() => {
    const texto = this.terminoBusqueda().toLowerCase().trim();

    if (!texto) return this.administradores();

    return this.administradores().filter(admin =>
      admin.nombre?.toLowerCase().includes(texto) ||
      admin.apellido?.toLowerCase().includes(texto) ||
      admin.username?.toLowerCase().includes(texto) ||
      admin.correo?.toLowerCase().includes(texto) ||
      admin.telefono?.toLowerCase().includes(texto) ||
      admin.rol?.toLowerCase().includes(texto) ||
      this.nombreClinica(admin.clinicaId)?.toLowerCase().includes(texto)
    );
  });

  constructor(
    private usuarioService: UsuarioService,
    private clinicaService: ClinicaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.usuarioService.obtenerAdminsClinica().subscribe({
      next: (datos) => this.administradores.set(datos),
      error: (err) => console.error('Error al cargar administradores:', err)
    });

    this.clinicaService.obtenerClinicas().subscribe({
      next: (datos) => this.clinicas.set(datos),
      error: (err) => console.error('Error al cargar clínicas:', err)
    });
  }

  buscarAdmin(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  obtenerId(admin: any): number {
    return admin.id ?? admin.idUsuario;
  }

  nombreClinica(id: number): string {
    const clinica = this.clinicas().find(c => (c.id ?? c.idClinica) === id);
    return clinica ? clinica.nombre : 'Sin sede asignada';
  }

  abrirNuevoAdmin(): void {
    this.modoEditar.set(false);
    this.adminEditando.set(null);

    this.form.reset({
      username: '',
      password: '',
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      clinicaId: null,
      rol: 'ADMIN_CLINICA',
      activo: true
    });

    this.mostrarModal.set(true);
  }

  abrirEditarAdmin(admin: any): void {
    this.modoEditar.set(true);
    this.adminEditando.set(admin);

    this.form.patchValue({
      username: admin.username,
      password: '',
      nombre: admin.nombre,
      apellido: admin.apellido,
      correo: admin.correo,
      telefono: admin.telefono,
      clinicaId: admin.clinicaId,
      rol: admin.rol,
      activo: admin.activo
    });

    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.adminEditando.set(null);
  }

  guardarAdmin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.modoEditar() && !this.form.value.password) {
      alert('La contraseña es obligatoria para crear un administrador.');
      return;
    }

    this.cargando.set(true);

    const body: any = {
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

    if (this.modoEditar() && this.adminEditando()) {
      this.usuarioService.actualizarUsuario(this.obtenerId(this.adminEditando()), body).subscribe({
        next: () => {
          this.cargando.set(false);
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => {
          this.cargando.set(false);
          console.error('Error al actualizar administrador:', err);
          alert('No se pudo actualizar el administrador.');
        }
      });

      return;
    }

    this.usuarioService.crearUsuario(body).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al crear administrador:', err);
        alert('No se pudo crear el administrador.');
      }
    });
  }

  cambiarEstado(admin: any): void {
    const body = {
      id: this.obtenerId(admin),
      username: admin.username,
      password: null,
      nombre: admin.nombre,
      apellido: admin.apellido,
      correo: admin.correo,
      telefono: admin.telefono,
      rol: admin.rol,
      activo: !admin.activo,
      clinicaId: admin.clinicaId
    };

    this.usuarioService.actualizarUsuario(this.obtenerId(admin), body).subscribe({
      next: () => this.cargarDatos(),
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }

  abrirModalCambioRol(admin: any, nuevoRol: string): void {
    if (admin.rol === nuevoRol) return;

    this.adminParaRol.set(admin);
    this.rolNuevoSeleccionado.set(nuevoRol);
    this.mostrarModalRol.set(true);
  }

  cerrarModalCambioRol(): void {
    this.mostrarModalRol.set(false);
    this.adminParaRol.set(null);
    this.rolNuevoSeleccionado.set('');
  }

  confirmarCambioRol(): void {
    const admin = this.adminParaRol();
    const nuevoRol = this.rolNuevoSeleccionado();

    if (!admin || !nuevoRol) return;

    const body = {
      id: this.obtenerId(admin),
      username: admin.username,
      password: null,
      nombre: admin.nombre,
      apellido: admin.apellido,
      correo: admin.correo,
      telefono: admin.telefono,
      rol: nuevoRol,
      activo: admin.activo,
      clinicaId: admin.clinicaId
    };

    this.usuarioService.actualizarUsuario(this.obtenerId(admin), body).subscribe({
      next: () => {
        this.cerrarModalCambioRol();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al cambiar rol:', err);
        alert('No se pudo cambiar el rol.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }
}