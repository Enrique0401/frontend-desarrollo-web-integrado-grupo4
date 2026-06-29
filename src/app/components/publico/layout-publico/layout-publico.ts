import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavegacionGeneralComponent } from '../navegacion-general.component/navegacion-general.component';
import { FooterPublicoComponent } from '../footer-publico.component/footer-publico.component';
import { FlechaComponent } from '../flecha/flecha';

@Component({
  selector: 'app-layout-publico',
  standalone: true,
  imports: [RouterOutlet, NavegacionGeneralComponent, FooterPublicoComponent, FlechaComponent],
  templateUrl: './layout-publico.html',
  styleUrl: './layout-publico.scss',
})
export class LayoutPublicoComponent {}
