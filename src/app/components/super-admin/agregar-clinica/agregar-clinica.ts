import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClinicaService } from '../../../services/clinica/clinica';

@Component({
  selector: 'app-agregar-clinica',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './agregar-clinica.html',
  styleUrl: './agregar-clinica.scss',
})
export class AgregarClinica implements OnInit {
  protected readonly cargando = signal(false);
  protected readonly exito = signal(false);
  protected readonly modoEditar = signal(false);

  private idClinicaEditar: number | null = null;
  private fb = new FormBuilder();

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    ruc: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
    correo: ['', [Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+$')]],
    planSuscripcion: ['PREMIUM', [Validators.required]],
    estado: ['ACTIVA'],
  });

  constructor(
    private clinicaService: ClinicaService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEditar.set(true);
      this.idClinicaEditar = Number(id);

      this.clinicaService.obtenerPorId(this.idClinicaEditar).subscribe({
        next: (clinica: any) => {
          this.form.patchValue({
            nombre: clinica.nombre,
            ruc: clinica.ruc,
            direccion: clinica.direccion,
            telefono: clinica.telefono,
            correo: clinica.correo,
            planSuscripcion: clinica.planSuscripcion,
            estado: clinica.estado,
          });
        },
        error: (err) => {
          console.error('Error al cargar la clínica:', err);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const datosFormulario: any = {
      id: this.idClinicaEditar,
      ...this.form.value,
    };

    if (this.modoEditar() && this.idClinicaEditar) {
      this.clinicaService.actualizar(this.idClinicaEditar, datosFormulario).subscribe({
        next: () => {
          this.cargando.set(false);
          this.exito.set(true);

          setTimeout(() => {
            this.router.navigate(['/panel/super-admin/clinicas']);
          }, 1200);
        },
        error: (err) => {
          this.cargando.set(false);
          console.error('Error al actualizar la clínica:', err);
          alert('No se pudo actualizar la clínica. Revisa consola.');
        },
      });

      return;
    }

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
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }
}
