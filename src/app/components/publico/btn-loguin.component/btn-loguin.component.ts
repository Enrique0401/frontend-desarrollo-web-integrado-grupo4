import { Component, computed, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario';

@Component({
  selector: 'app-btn-loguin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './btn-loguin.component.html',
  styleUrl: './btn-loguin.component.scss'
})
export class BtnLoguinComponent {
  protected readonly usuario = computed(() => this.usuarioService.usuarioActual());
  protected readonly mostrarConfirmacion = signal(false);

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  abrirConfirmacion(): void {
    this.mostrarConfirmacion.set(true);
  }

  cancelarCierre(): void {
    this.mostrarConfirmacion.set(false);
  }

  confirmarCierreSesion(): void {
    this.usuarioService.logout();
    this.mostrarConfirmacion.set(false);
    this.router.navigate(['/']);
  }
}