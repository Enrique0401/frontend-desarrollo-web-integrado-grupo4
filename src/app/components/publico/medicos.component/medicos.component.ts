import { Component } from '@angular/core';
import { NavegacionGeneralComponent } from '../navegacion-general.component/navegacion-general.component';
import { MedicosCardComponent } from '../medicos-card.component/medicos-card.component';
import { FlechaComponent } from '../flecha/flecha';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [NavegacionGeneralComponent, MedicosCardComponent, FlechaComponent],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.scss',
})
export class MedicosComponent {
}