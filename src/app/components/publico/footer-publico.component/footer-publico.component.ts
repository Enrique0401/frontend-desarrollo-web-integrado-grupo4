import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer-publico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer-publico.component.html',
  styleUrl: './footer-publico.component.scss',
})
export class FooterPublicoComponent {
  anio = new Date().getFullYear();
}
