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
  selector: 'app-pantalla-recepcionista',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './pantalla-recepcionista.html',
  styleUrl: './pantalla-recepcionista.scss',
})
export class PantallaRecepcionista implements OnInit {
  nombreRecepcionista = signal<string>('Cargando...');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getPerfil().subscribe({
      next: (usuario: UsuarioPerfil) => {
        this.nombreRecepcionista.set(usuario.nombre);
      },
      error: () => {
        this.router.navigate(['/iniciar-sesion']);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}