import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private _usuarioActual = signal<Usuario | null>(null);
  public usuarioActual = computed(() => this._usuarioActual());

  loginMock(username: string): Observable<Usuario> {
    const mockUser: Usuario = { idUsuario: 1, username, correo: 'admin@clinica.com', nombre: 'Admin', apellido: 'Sistema', rol: 'SUPER_ADMIN', activo: true, clinicaId: 1 };
    this._usuarioActual.set(mockUser);
    return of(mockUser).pipe(delay(800));
  }

  logout(): void {
    this._usuarioActual.set(null);
  }
}