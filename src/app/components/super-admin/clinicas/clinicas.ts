import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClinicaService } from '../../../services/clinica/clinica';

@Component({
  selector: 'app-clinicas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './clinicas.html',
  styleUrl: './clinicas.scss'
})
export class Clinicas implements OnInit {

  clinicas = signal<any[]>([]);
  terminoBusqueda = signal('');

  clinicasFiltradas = computed(() => {
    const texto = this.terminoBusqueda().toLowerCase().trim();

    if (!texto) {
      return this.clinicas();
    }

    return this.clinicas().filter(clinica =>
      clinica.nombre?.toLowerCase().includes(texto) ||
      clinica.direccion?.toLowerCase().includes(texto) ||
      clinica.telefono?.toLowerCase().includes(texto) ||
      clinica.ruc?.toLowerCase().includes(texto) ||
      clinica.planSuscripcion?.toLowerCase().includes(texto) ||
      clinica.estado?.toLowerCase().includes(texto)
    );
  });

  constructor(
    private clinicaService: ClinicaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.clinicaService.obtenerClinicas().subscribe({
      next: (datos) => {
        this.clinicas.set(datos);
      },
      error: (err) => {
        console.error('Error al cargar clínicas:', err);
      }
    });
  }

  buscarSede(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  obtenerId(clinica: any): number {
    return clinica.id ?? clinica.idClinica;
  }

  editarClinica(clinica: any): void {
    this.router.navigate([
      '/panel/super-admin/editar-clinica',
      this.obtenerId(clinica)
    ]);
  }

  toggleEstado(clinica: any): void {

    const nuevoEstado =
      clinica.estado === 'ACTIVA'
        ? 'SUSPENDIDA'
        : 'ACTIVA';

    const body = {
      nombre: clinica.nombre,
      ruc: clinica.ruc,
      direccion: clinica.direccion,
      telefono: clinica.telefono,
      correo: clinica.correo,
      planSuscripcion: clinica.planSuscripcion,
      estado: nuevoEstado
    };

    this.clinicaService.actualizar(this.obtenerId(clinica), body).subscribe({
      next: () => {
        this.cargarSedes();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
      }
    });

  }
}