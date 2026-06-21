import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

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
      telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
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
        
        const mensajeError = err.error?.message || err.error?.mensaje || '';
        const errorString = JSON.stringify(err).toLowerCase();

        // 🛡️ DETECTOR DE ERROR FATAL: Usuario duplicado
        if (errorString.includes('duplicate') || errorString.includes('unique') || errorString.includes('usuario') || err.status === 500) {
          
          this.form.controls.username.setErrors({ ocupado: true });

          // --- LÓGICA DE SUGERENCIAS DE USUARIO ---
          // Limpiamos los espacios y los pasamos a minúsculas
          const nom = nombre?.toLowerCase().replace(/\s+/g, '') || 'usuario';
          const ape = apellido?.toLowerCase().replace(/\s+/g, '') || 'nuevo';
          
          // Generamos números aleatorios para darle variedad
          const rnd1 = Math.floor(Math.random() * 100);
          const rnd2 = Math.floor(Math.random() * 1000);
          const rnd3 = Math.floor(Math.random() * 99) + 10;

          // Creamos el array con 5 opciones creativas
          const sugerencias = [
            `${nom}${ape}${rnd1}`,
            `${nom}.${ape}`,
            `${ape}${nom}${rnd2}`,
            `${nom}_${ape}`,
            `${nom}${rnd3}`
          ];

          // Unimos el array en un string separado por comas
          this.errorMensaje.set(`Prueba con estos nombres: ${sugerencias.join(', ')}`);
          
        } else {
          this.errorMensaje.set(mensajeError || 'Error al registrar en la base de datos.');
        }
        
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