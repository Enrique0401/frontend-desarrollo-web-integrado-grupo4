import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from '../../../services/auth';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './iniciar-sesion.component.html',
  styleUrl: './iniciar-sesion.component.scss',
})
export class IniciarSesionComponent {
  cargando = signal(false);
  errorMensaje = signal<string | null>(null);
  mostrarPassword = signal(false);

  private fb = new FormBuilder();

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  onSubmit(): void {
    if (this.cargando()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    this.authService.limpiarSesion();

    const credenciales = {
      username: this.form.value.username || '',
      password: this.form.value.password || ''
    };

    this.authService.login(credenciales).subscribe({
      next: (respuesta: AuthResponse) => {
        this.cargando.set(false);
        this.redirigirPorRol(respuesta.rol);
      },
      error: (err: any) => {
        console.error('Error al iniciar sesion:', err);

        this.authService.limpiarSesion();
        this.cargando.set(false);
        this.errorMensaje.set('Credenciales incorrectas.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  get usernameInvalido(): boolean {
    return this.campoInvalido('username');
  }

  get passwordInvalido(): boolean {
    return this.campoInvalido('password');
  }

  private redirigirPorRol(rol: string): void {
    const rolNormalizado = (rol || '').toUpperCase().replace('ROLE_', '');

    const rutasPorRol: Record<string, string> = {
      SUPER_ADMIN: '/panel/super-admin/dashboard',
      ADMIN_CLINICA: '/panel/admin-clinica/dashboard',
      RECEPCIONISTA: '/panel/recepcion/panel-principal',
      MEDICO: '/panel/medico/dashboard',
      ENFERMERA: '/panel/enfermeria/sala-espera',
      PACIENTE: '/panel/paciente/datos-paciente',
      PERSONAL_ADMINISTRATIVO: '/panel/recepcion/panel-principal'
    };

    this.router.navigateByUrl(rutasPorRol[rolNormalizado] || '/');
  }
}
