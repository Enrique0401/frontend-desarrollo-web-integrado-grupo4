import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClinicaService } from '../../../services/clinica/clinica'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-clinicas',
  standalone: true,
  imports: [RouterLink], // Importamos RouterLink para el botón de "Nueva Sede"
  templateUrl: './clinicas.html',
  styleUrl: './clinicas.scss'
})
export class Clinicas implements OnInit {
  // Solo necesitamos la variable para guardar los datos
  clinicas = signal<any[]>([]);

  constructor(private clinicaService: ClinicaService) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  // GET: Llama al servicio y llena la tabla
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
}