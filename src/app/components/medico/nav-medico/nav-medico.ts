import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-nav-medico',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './nav-medico.html',
  styleUrl: './nav-medico.scss'
})
export class NavMedico {
  constructor(private router: Router) {}

  recargar(): void {
    window.location.reload();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    this.router.navigate(['/iniciar-sesion']);
  }
}