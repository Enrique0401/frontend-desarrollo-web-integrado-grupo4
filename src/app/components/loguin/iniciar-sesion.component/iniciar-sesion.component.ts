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
        console.log('Conexion exitosa a la BD! Token:', respuesta.token);
        console.log('El rol detectado es:', respuesta.rol);

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
    const rolNormalizado = (rol || '').toUpperCase();

    switch (rolNormalizado) {
      case 'SUPER_ADMIN':
        this.router.navigate(['/panel/super-admin']);
        break;

      case 'ADMIN_CLINICA':
        this.router.navigate(['/panel/admin-clinica']);
        break;

      case 'RECEPCIONISTA':
        this.router.navigate(['/panel/recepcion/panel-principal']);
        break;

      case 'ENFERMERA':
        this.router.navigate(['/panel/enfermeria/sala-espera']);
        break;

      case 'MEDICO':
        this.router.navigate(['/panel/medico/consulta']);
        break;

      case 'PACIENTE':
        this.router.navigate(['/panel/paciente/datos-paciente']);
        break;

      case 'PERSONAL_ADMINISTRATIVO':
        this.router.navigate(['/panel/personal-administrativo']);
        break;

      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
