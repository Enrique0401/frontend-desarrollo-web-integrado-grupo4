import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario';

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
    private usuarioService: UsuarioService,
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

    this.usuarioService
      .registrar({ nombre: nombre!, apellido: apellido!, correo: correo!, username: username!, password: password! })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.exito.set(true);
          setTimeout(() => this.router.navigate(['/iniciar-sesion']), 1500);
        },
        error: (err: Error) => {
          this.cargando.set(false);
          this.errorMensaje.set(err.message);
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