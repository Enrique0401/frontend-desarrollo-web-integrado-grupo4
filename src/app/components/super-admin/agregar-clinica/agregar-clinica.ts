import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClinicaService } from '../../../services/clinica/clinica'; // Ajusta la ruta si difiere

@Component({
  selector: 'app-agregar-clinica',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './agregar-clinica.html',
  styleUrl: './agregar-clinica.scss'
})
export class AgregarClinica {
  protected readonly cargando = signal(false);
  protected readonly exito = signal(false);

  private fb = new FormBuilder();
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    // RUC: Exactamente 11 números
    ruc: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]], 
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    // Teléfono: Empieza con 9 y tiene exactamente 9 números en total
    telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
    correo: ['', [Validators.required, Validators.email]],
    planSuscripcion: ['PREMIUM', [Validators.required]],
    estado: ['ACTIVA'] 
  });

  constructor(
    private clinicaService: ClinicaService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const datosFormulario = this.form.value as any;

    this.clinicaService.registrarClinica(datosFormulario).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set(true);
        setTimeout(() => {
          this.router.navigate(['/panel/super-admin/clinicas']);
        }, 1500);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al guardar la clínica:', err);
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }
}