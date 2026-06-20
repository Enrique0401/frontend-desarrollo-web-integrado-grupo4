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
  ) {}

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
        
        localStorage.setItem('token', respuesta.token); 
        console.log('¡Conexión exitosa a la BD! Token:', respuesta.token);

        this.router.navigate(['/']);
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