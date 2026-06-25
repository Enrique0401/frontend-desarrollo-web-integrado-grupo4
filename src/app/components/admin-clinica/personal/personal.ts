import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from '../../../services/usuario/usuario';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './personal.html',
  styleUrl: './personal.scss'
})
export class Personal implements OnInit {
  personal = signal<any[]>([]);
  terminoBusqueda = signal('');

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPersonal();
  }

  obtenerUsernameDesdeToken(): string | null {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || null;
    } catch {
      return null;
    }
  }

  cargarPersonal(): void {
    const username = this.obtenerUsernameDesdeToken();

    if (!username) {
      console.error('No se encontró username en el token');
      return;
    }

    this.usuarioService.obtenerPorUsername(username).subscribe({
      next: (usuario) => {
        if (!usuario.clinicaId) {
          console.error('Usuario sin clínica asignada:', usuario);
          return;
        }

        this.usuarioService.obtenerPorClinica(usuario.clinicaId).subscribe({
          next: (datos) => {
            const filtrados = datos.filter(
              u =>
                u.rol === 'MEDICO' ||
                u.rol === 'ENFERMERA' ||
                u.rol === 'RECEPCIONISTA' ||
                u.rol === 'PERSONAL_ADMINISTRATIVO'
            );

            this.personal.set(filtrados);
          },
          error: (err) => console.error('Error al cargar personal:', err)
        });
      },
      error: (err) => console.error('Error al obtener usuario logueado:', err)
    });
  }

  personalFiltrado = computed(() => {
    const texto = this.terminoBusqueda().toLowerCase().trim();

    if (!texto) {
      return this.personal();
    }

    return this.personal().filter(p =>
      p.nombre?.toLowerCase().includes(texto) ||
      p.apellido?.toLowerCase().includes(texto) ||
      p.username?.toLowerCase().includes(texto) ||
      p.correo?.toLowerCase().includes(texto) ||
      p.telefono?.toLowerCase().includes(texto) ||
      p.rol?.toLowerCase().includes(texto)
    );
  });

  totalPersonal = computed(() => this.personal().length);

  totalMedicos = computed(() =>
    this.personal().filter(p => p.rol === 'MEDICO').length
  );

  totalEnfermeras = computed(() =>
    this.personal().filter(p => p.rol === 'ENFERMERA').length
  );

  totalRecepcionistas = computed(() =>
    this.personal().filter(p => p.rol === 'RECEPCIONISTA').length
  );

  buscarPersonal(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  obtenerId(persona: any): number {
    return persona.id ?? persona.idUsuario;
  }

  nuevoPersonal(): void {
    this.router.navigate(['/panel/admin-clinica/agregar-personal']);
  }

  editarPersonal(persona: any): void {
    this.router.navigate(['/panel/admin-clinica/editar-personal', this.obtenerId(persona)]);
  }

  cambiarEstado(persona: any): void {
    const body = {
      id: this.obtenerId(persona),
      username: persona.username,
      password: null,
      nombre: persona.nombre,
      apellido: persona.apellido,
      correo: persona.correo,
      telefono: persona.telefono,
      rol: persona.rol,
      activo: !persona.activo,
      clinicaId: persona.clinicaId
    };

    this.usuarioService.actualizarUsuario(this.obtenerId(persona), body).subscribe({
      next: () => this.cargarPersonal(),
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }
}