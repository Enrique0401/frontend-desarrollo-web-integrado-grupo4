import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

type TipoDocumento = 'DNI' | 'PASAPORTE' | 'CARNET_EXTRANJERIA';

function passwordsIgualesValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  return password === confirmar ? null : { passwordsNoCoinciden: true };
}

function fechaNacimientoValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;

  const fechaNacimiento = new Date(`${valor}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fechaNacimiento > hoy ? { fechaFutura: true } : null;
}

function obtenerFechaHoyInput(): string {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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
  protected readonly fechaMaximaNacimiento = obtenerFechaHoyInput();

  private fb = new FormBuilder();

  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', [Validators.required, fechaNacimientoValidator]],
      tipoDocumento: ['DNI', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      genero: ['OTRO', [Validators.required]],
      seguroMedico: ['NINGUNO', [Validators.required]],
      numeroSeguro: [{ value: '', disabled: true }, [Validators.maxLength(25)]],
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
      this.actualizarValidadoresDocumento((tipo || 'DNI') as TipoDocumento);
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
        numSeguroCtrl?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(25)
        ]);
      }

      numSeguroCtrl?.updateValueAndValidity();
    });
  }

  private actualizarValidadoresDocumento(tipo: TipoDocumento): void {
    const controlDoc = this.form.get('numeroDocumento');

    if (tipo === 'DNI') {
      controlDoc?.setValidators([
        Validators.required,
        Validators.pattern('^[0-9]{8}$')
      ]);
    } else if (tipo === 'PASAPORTE') {
      controlDoc?.setValidators([
        Validators.required,
        Validators.pattern('^[A-Z][0-9]{8}$')
      ]);
    } else {
      controlDoc?.setValidators([
        Validators.required,
        Validators.pattern('^[0-9]{9}$')
      ]);
    }

    controlDoc?.updateValueAndValidity();
  }

  get maxLengthDocumento(): number {
    const tipo = this.form.get('tipoDocumento')?.value as TipoDocumento;

    if (tipo === 'DNI') return 8;
    if (tipo === 'PASAPORTE') return 9;
    return 9;
  }

  get placeholderDocumento(): string {
    const tipo = this.form.get('tipoDocumento')?.value as TipoDocumento;

    if (tipo === 'DNI') return '8 números';
    if (tipo === 'PASAPORTE') return 'Ej: A12345678';
    return '9 números';
  }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  limitarTelefono(): void {
    const control = this.form.get('telefono');
    const valor = String(control?.value || '').replace(/\D/g, '').slice(0, 9);
    control?.setValue(valor, { emitEvent: false });
  }

  limitarNumeroSeguro(): void {
    const control = this.form.get('numeroSeguro');
    const valor = String(control?.value || '').slice(0, 25);
    control?.setValue(valor, { emitEvent: false });
  }

  limitarNumeroDocumento(): void {
    const control = this.form.get('numeroDocumento');
    const tipo = this.form.get('tipoDocumento')?.value as TipoDocumento;
    let valor = String(control?.value || '').toUpperCase();

    if (tipo === 'DNI') {
      valor = valor.replace(/\D/g, '').slice(0, 8);
    } else if (tipo === 'PASAPORTE') {
      const primeraLetra = valor.slice(0, 1).replace(/[^A-Z]/g, '');
      const numeros = valor.slice(1).replace(/\D/g, '').slice(0, 8);
      valor = `${primeraLetra}${numeros}`.slice(0, 9);
    } else {
      valor = valor.replace(/\D/g, '').slice(0, 9);
    }

    control?.setValue(valor, { emitEvent: false });
  }

  bloquearTelefono(event: KeyboardEvent): void {
    this.bloquearSiNoEsNumero(event);
  }

  bloquearNumeroSeguro(event: KeyboardEvent): void {
    const permitido = this.esTeclaControl(event);
    if (permitido) return;

    const input = event.target as HTMLInputElement;
    const tieneSeleccion = input.selectionStart !== input.selectionEnd;

    if (input.value.length >= 25 && !tieneSeleccion) {
      event.preventDefault();
    }
  }

  bloquearNumeroDocumento(event: KeyboardEvent): void {
    if (this.esTeclaControl(event)) return;

    const tipo = this.form.get('tipoDocumento')?.value as TipoDocumento;
    const input = event.target as HTMLInputElement;
    const tecla = event.key;
    const tieneSeleccion = input.selectionStart !== input.selectionEnd;

    if (input.value.length >= this.maxLengthDocumento && !tieneSeleccion) {
      event.preventDefault();
      return;
    }

    if (tipo === 'DNI' || tipo === 'CARNET_EXTRANJERIA') {
      if (!/^[0-9]$/.test(tecla)) {
        event.preventDefault();
      }
      return;
    }

    if (tipo === 'PASAPORTE') {
      const posicion = input.selectionStart ?? input.value.length;

      if (posicion === 0) {
        if (!/^[a-zA-Z]$/.test(tecla)) {
          event.preventDefault();
        }
      } else if (!/^[0-9]$/.test(tecla)) {
        event.preventDefault();
      }
    }
  }

  private bloquearSiNoEsNumero(event: KeyboardEvent): void {
    if (this.esTeclaControl(event)) return;

    const input = event.target as HTMLInputElement;
    const tieneSeleccion = input.selectionStart !== input.selectionEnd;

    if (input.value.length >= 9 && !tieneSeleccion) {
      event.preventDefault();
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private esTeclaControl(event: KeyboardEvent): boolean {
    const teclasPermitidas = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    return teclasPermitidas.includes(event.key) || event.ctrlKey || event.metaKey;
  }

  onSubmit(): void {
    if (this.cargando()) return;

    this.limitarTelefono();
    this.limitarNumeroDocumento();
    this.limitarNumeroSeguro();

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
      fechaNacimiento: formValues.fechaNacimiento!,
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

        const esDuplicado =
          err.status === 409 ||
          errorString.includes('duplicate entry') ||
          errorString.includes('unique');

        if (esDuplicado) {
          this.form.controls.username.setErrors({ ocupado: true });

          const nom = formValues.nombre?.toLowerCase().replace(/\s+/g, '') || 'usuario';
          const ape = formValues.apellido?.toLowerCase().replace(/\s+/g, '') || 'nuevo';
          const rnd1 = Math.floor(Math.random() * 100);
          const rnd2 = Math.floor(Math.random() * 1000);
          const sugerencias = [`${nom}${ape}${rnd1}`, `${nom}.${ape}`, `${ape}${nom}${rnd2}`];

          this.errorMensaje.set(`Ese usuario ya existe. Prueba con: ${sugerencias.join(', ')}`);
        } else if (err.status === 500) {
          this.errorMensaje.set('Error 500: MySQL rechazó los datos. Verifica que el backend acepte los campos enviados.');
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