import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth'; // <--- Cambiado al servicio real

function passwordsIgualesValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  return password === confirmar ? null : { passwordsNoCoinciden: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistroComponent {
  protected readonly cargando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exito = signal(false);
  protected readonly mostrarPassword = signal(false);

  private fb = new FormBuilder();
  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmarPassword: ['', [Validators.required]],
    },
    { validators: passwordsIgualesValidator }
  );

  constructor(
    private authService: AuthService, // <--- Inyectamos el servicio real
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

    const { nombre, apellido, correo, username, password } = this.form.value;

    const nuevoPaciente = {
      nombre: nombre!,
      apellido: apellido!,
      correo: correo!,
      username: username!,
      password: password!,
      rol: 'PACIENTE'
    };

    // Viaje directo al backend en Render -> Base de datos en Aiven
    this.authService.registrar(nuevoPaciente).subscribe({
      next: (respuesta: any) => {
        this.cargando.set(false);
        this.exito.set(true);
        // Redirige al login tras un breve delay para que vea el mensaje de éxito
        setTimeout(() => this.router.navigate(['/iniciar-sesion']), 1500);
      },
      error: (err: any) => {
        this.cargando.set(false);
        // Si el usuario o correo ya existen, Spring Boot devolverá el mensaje de error aquí
        this.errorMensaje.set(err.error?.mensaje || err.message || 'Error al registrar en la base de datos.');
        console.error('Error de registro en el backend:', err);
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  get passwordsNoCoinciden(): boolean {
    return !!this.form.errors?.['passwordsNoCoinciden'] && this.form.controls.confirmarPassword.touched;
  }
}