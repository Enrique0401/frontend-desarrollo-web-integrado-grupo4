import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';

interface UsuarioPerfil {
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

@Component({
  selector: 'app-pantalla-enfermera',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './pantalla-enfermera.html',
  styleUrl: './pantalla-enfermera.scss',
})
export class PantallaEnfermera implements OnInit {
  nombreEnfermera = signal<string>('Cargando...');

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getPerfil().subscribe({
      next: (usuario: UsuarioPerfil) => {
        this.nombreEnfermera.set(usuario.nombre);
      },
      error: () => {
        this.router.navigate(['/iniciar-sesion']);
      }
    });
  }

  estaEnTriage(): boolean {
    return this.router.url.includes('/panel/enfermeria/triage');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}