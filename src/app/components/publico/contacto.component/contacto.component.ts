import { Component } from '@angular/core';
import { NavegacionGeneralComponent } from '../navegacion-general.component/navegacion-general.component';
import { FlechaComponent } from '../flecha/flecha';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [NavegacionGeneralComponent, FlechaComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss',
})
export class ContactoComponent {

}