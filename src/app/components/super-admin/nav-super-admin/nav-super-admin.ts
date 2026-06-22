import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-nav-super-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './nav-super-admin.html',
  styleUrl: './nav-super-admin.scss',
})
export class NavSuperAdmin {
  constructor(private router: Router) {}

  salir(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    this.router.navigate(['/iniciar-sesion']);
  }
}