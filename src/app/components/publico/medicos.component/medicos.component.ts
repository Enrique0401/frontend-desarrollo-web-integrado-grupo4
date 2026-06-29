import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MedicosCardComponent } from '../medicos-card.component/medicos-card.component';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [MedicosCardComponent, RouterLink],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.scss',
})
export class MedicosComponent {}