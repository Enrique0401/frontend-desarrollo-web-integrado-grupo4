import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

interface UsuarioRegistrado extends Usuario {
  password: string;
}

interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password: string;
  rol?: string;
}

const STORAGE_KEY = 'nova_salud_usuarios';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private _usuarioActual = signal<Usuario | null>(null);
  public usuarioActual = computed(() => this._usuarioActual());

  private usuarios: UsuarioRegistrado[] = this.cargarUsuarios();

  private cargarUsuarios(): UsuarioRegistrado[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private guardarUsuarios(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usuarios));
  }

  registrar(datos: DatosRegistro): Observable<Usuario> {
    const existeUsername = this.usuarios.some(
      (u) => u.username.toLowerCase() === datos.username.toLowerCase()
    );
    const existeCorreo = this.usuarios.some(
      (u) => u.correo.toLowerCase() === datos.correo.toLowerCase()
    );

    if (existeUsername) {
      return throwError(() => new Error('Ese nombre de usuario ya está registrado.')).pipe(delay(600));
    }
    if (existeCorreo) {
      return throwError(() => new Error('Ese correo ya está registrado.')).pipe(delay(600));
    }

    const nuevoUsuario: UsuarioRegistrado = {
      idUsuario: this.usuarios.length + 1,
      username: datos.username,
      correo: datos.correo,
      nombre: datos.nombre,
      apellido: datos.apellido,
      password: datos.password,
      rol: 'PACIENTE',
      activo: true,
      clinicaId: 1,
    };

    this.usuarios.push(nuevoUsuario);
    this.guardarUsuarios();

    const { password: _password, ...usuarioSinPassword } = nuevoUsuario;
    return of(usuarioSinPassword).pipe(delay(800));
  }

  login(username: string, password: string): Observable<Usuario> {
    const encontrado = this.usuarios.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!encontrado) {
      return throwError(
        () => new Error('Usuario o contraseña incorrectos, o aún no te has registrado.')
      ).pipe(delay(600));
    }

    const { password: _pw, ...usuarioSinPassword } = encontrado;
    this._usuarioActual.set(usuarioSinPassword);
    return of(usuarioSinPassword).pipe(delay(800));
  }

  logout(): void {
    this._usuarioActual.set(null);
  }
}