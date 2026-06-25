import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-nav-admin-clinica',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './nav-admin-clinica.html',
  styleUrl: './nav-admin-clinica.scss'
})
export class NavAdminClinica {

  constructor(private router: Router) {}

  // Recarga toda la página al hacer clic en el logo
  recargarPagina(): void {
    window.location.reload();
  }

  // Cerrar sesión
  salir(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');

    this.router.navigate(['/iniciar-sesion']);
  }

}