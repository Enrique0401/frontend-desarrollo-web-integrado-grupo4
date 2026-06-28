import { Component, OnInit, signal } from '@angular/core';
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
export class RegistroComponent implements OnInit {
  protected readonly cargando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exito = signal(false);
  protected readonly mostrarPassword = signal(false);

  private fb = new FormBuilder();
  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      tipoDocumento: ['DNI', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      genero: ['OTRO', [Validators.required]],
      seguroMedico: ['NINGUNO', [Validators.required]],
      numeroSeguro: [{ value: '', disabled: true }],
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
  ) { }

  ngOnInit(): void {
    this.actualizarValidadoresDocumento('DNI');

    this.form.get('tipoDocumento')?.valueChanges.subscribe(tipo => {
      this.actualizarValidadoresDocumento(tipo || 'DNI');
      this.form.get('numeroDocumento')?.setValue('');
      this.form.get('numeroDocumento')?.markAsUntouched();
    });

    this.form.get('seguroMedico')?.valueChanges.subscribe(seguro => {
      const numSeguroCtrl = this.form.get('numeroSeguro');
      if (seguro === 'NINGUNO' || !seguro) {
        numSeguroCtrl?.disable();
        numSeguroCtrl?.clearValidators();
        numSeguroCtrl?.setValue('');
      } else {
        numSeguroCtrl?.enable();
        numSeguroCtrl?.setValidators([Validators.required, Validators.minLength(3)]);
      }
      numSeguroCtrl?.updateValueAndValidity();
    });
  }

  private actualizarValidadoresDocumento(tipo: string): void {
    const controlDoc = this.form.get('numeroDocumento');
    if (tipo === 'DNI') {
      controlDoc?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
    } else if (tipo === 'PASAPORTE') {
      controlDoc?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][0-9]{8}$')]);
    } else {
      controlDoc?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]{9}$')]);
    }
    controlDoc?.updateValueAndValidity();
  }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.cargando()) { return; }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    const formValues = this.form.getRawValue();

    const nuevoPaciente = {
      nombre: formValues.nombre!,
      apellido: formValues.apellido!,
      tipoDocumento: formValues.tipoDocumento!,
      numeroDocumento: formValues.numeroDocumento!,
      genero: formValues.genero!,
      seguroMedico: formValues.seguroMedico!,
      numeroSeguro: formValues.numeroSeguro || 'NO_TIENE',
      correo: formValues.correo!,
      telefono: formValues.telefono!,
      username: formValues.username!,
      password: formValues.password!,
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

        const esDuplicado = err.status === 409 || errorString.includes('duplicate entry') || errorString.includes('unique');

        if (esDuplicado) {
          this.form.controls.username.setErrors({ ocupado: true });

          const nom = formValues.nombre?.toLowerCase().replace(/\s+/g, '') || 'usuario';
          const ape = formValues.apellido?.toLowerCase().replace(/\s+/g, '') || 'nuevo';
          const rnd1 = Math.floor(Math.random() * 100);
          const rnd2 = Math.floor(Math.random() * 1000);
          const sugerencias = [`${nom}${ape}${rnd1}`, `${nom}.${ape}`, `${ape}${nom}${rnd2}`];

          this.errorMensaje.set(`Ese usuario ya existe. Prueba con: ${sugerencias.join(', ')}`);

        } else if (err.status === 500) {
          this.errorMensaje.set('Error 500: ¡MySQL rechazó los datos! Asegúrate de haber ejecutado los ALTER TABLE para actualizar los ENUM en tu BD.');
        } else {
          this.errorMensaje.set(mensajeError || 'Error inesperado al registrar.');
        }

        console.error('Error detallado del backend:', err);
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