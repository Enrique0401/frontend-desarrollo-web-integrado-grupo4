import { Component, OnInit, signal } from '@angular/core';
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

  constructor(
    private clinicaService: ClinicaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.clinicaService.obtenerClinicas().subscribe({
      next: (datosBD) => {
        this.clinicas.set(datosBD);
        
        if (typeof this.clinicaService.actualizarSignal === 'function') {
          this.clinicaService.actualizarSignal(datosBD);
        }
      },
      error: (err) => {
        console.error('Error al traer clínicas del backend:', err);
      }
    });
  }

  // Función para ir a la pantalla de edición
  editarClinica(clinica: any): void {
    this.router.navigate(['../editar-clinica', clinica.id]);
  }

  // Función para cambiar el estado entre ACTIVA e INACTIVA
  toggleEstado(clinica: any): void {
    const nuevoEstado = clinica.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    
    // Armamos el objeto con el estado invertido
    const clinicaActualizada = { ...clinica, estado: nuevoEstado };

    // Enviamos el PUT al backend
    this.clinicaService.actualizar(clinica.id, clinicaActualizada).subscribe({
      next: () => {
        // Refrescamos la tabla para ver los cambios impactados
        this.cargarSedes();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la clínica:', err);
      }
    });
  }
}