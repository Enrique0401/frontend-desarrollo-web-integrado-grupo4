import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pantalla-super-admin',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Esenciales para la navegación interna
  templateUrl: './pantalla-super-admin.html',
  styleUrl: './pantalla-super-admin.scss'
})
export class PantallaSuperAdmin {
  private router = inject(Router);

  cerrarSesion(): void {
    // Limpiamos el token de seguridad
    localStorage.removeItem('token');
    // Redirigimos al login
    this.router.navigate(['/iniciar-sesion']);
  }
}