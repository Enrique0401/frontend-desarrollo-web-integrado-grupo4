import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './iniciar-sesion.component.html',
  styleUrl: './iniciar-sesion.component.scss',
})
export class IniciarSesionComponent {
  protected readonly cargando = signal(false);
  protected readonly mostrarPassword = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  private fb = new FormBuilder();
  protected readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    recordarme: [false],
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    const credenciales = {
      username: this.form.value.username,
      password: this.form.value.password
    };

    this.authService.login(credenciales).subscribe({
      next: (respuesta: any) => {
        this.cargando.set(false);

        const token = respuesta.token;
        localStorage.setItem('token', token);
        console.log('¡Conexión exitosa a la BD! Token:', token);

        // Extraemos los datos ocultos dentro del Token JWT
        const payloadDecodificado = JSON.parse(atob(token.split('.')[1]));
        const rolUsuario = payloadDecodificado.rol;

        console.log('El rol detectado es:', rolUsuario);

        // Redirigimos a la pantalla correspondiente (AHORA SÍ INCLUYEN /panel)
        switch (rolUsuario) {
          case 'SUPER_ADMIN':
            this.router.navigate(['/panel/super-admin']);
            break;
          case 'ADMIN_CLINICA':
            this.router.navigate(['/panel/admin-clinica']);
            break;
          case 'RECEPCIONISTA':
            this.router.navigate(['/panel/recepcion']);
            break;
          case 'MEDICO':
            this.router.navigate(['/panel/medico']);
            break;
          case 'ENFERMERA':
            this.router.navigate(['/panel/enfermeria']);
            break;
          case 'PACIENTE':
            this.router.navigate(['/panel/paciente']);
            break;
          default:
            this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        this.cargando.set(false);
        this.errorMensaje.set('Credenciales incorrectas o el usuario no existe.');
        console.error('Error del backend:', err);
      },
    });
  }

  get usernameInvalido(): boolean {
    const c = this.form.controls.username;
    return c!.invalid && c!.touched;
  }

  get passwordInvalido(): boolean {
    const c = this.form.controls.password;
    return c!.invalid && c!.touched;
  }
}