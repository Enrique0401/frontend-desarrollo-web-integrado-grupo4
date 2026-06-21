import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth'; // Asegúrate de que esta ruta apunte a tu AuthService real

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
      telefono: ['', [Validators.required, Validators.minLength(7), Validators.pattern('^[0-9]+$')]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmarPassword: ['', [Validators.required]],
    },
    { validators: passwordsIgualesValidator }
  );

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

    const { nombre, apellido, correo, telefono, username, password } = this.form.value;

    const nuevoPaciente = {
      nombre: nombre!,
      apellido: apellido!,
      correo: correo!,
      telefono: telefono!,
      username: username!,
      password: password!,
      rol: 'PACIENTE'
    };

    this.authService.registrar(nuevoPaciente).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set(true);
        setTimeout(() => this.router.navigate(['/iniciar-sesion']), 1500);
      },
      error: (err: any) => {
        this.cargando.set(false);
        this.errorMensaje.set(err.error?.message || err.error?.mensaje || 'Error al registrar en la base de datos.');
        console.error('Error del backend:', err);
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