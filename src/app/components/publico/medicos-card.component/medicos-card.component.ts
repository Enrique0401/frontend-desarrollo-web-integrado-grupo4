import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Especialidad } from '../../../models/especialidades.model';
import { ESPECIALIDADES_PUBLICAS } from './especialidades.data';

@Component({
  selector: 'app-medicos-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './medicos-card.component.html',
  styleUrl: './medicos-card.component.scss',
})
export class MedicosCardComponent {
  especialidades = ESPECIALIDADES_PUBLICAS;
  especialidadSeleccionada: Especialidad | null = null;

  abrirDetalle(especialidad: Especialidad): void {
    this.especialidadSeleccionada = especialidad;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.especialidadSeleccionada = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrarDetalle();
  }
}
