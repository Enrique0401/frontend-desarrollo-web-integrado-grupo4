import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../../services/usuario/usuario';
import { MedicoService } from '../../../services/medico/medico';
import { CitaService } from '../../../services/cita/cita';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pantalla-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pantalla-medico.html',
  styleUrl: './pantalla-medico.scss'
})
export class PantallaMedico implements OnInit {
  nombreMedico = signal('Médico');

  usuarioActual = signal<any | null>(null);
  medicoActual = signal<any | null>(null);
  citas = signal<any[]>([]);

  constructor(
    private usuarioService: UsuarioService,
    private medicoService: MedicoService,
    private citaService: CitaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMedicoLogueado();
  }

  obtenerUsernameDesdeToken(): string | null {
    const token = localStorage.getItem('token');

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || null;
    } catch {
      return null;
    }
  }

  cargarMedicoLogueado(): void {
    const username = this.obtenerUsernameDesdeToken();

    if (!username) {
      console.error('No se encontró username en el token.');
      return;
    }

    this.usuarioService.obtenerPorUsername(username).subscribe({
      next: (usuario) => {
        this.usuarioActual.set(usuario);
        this.nombreMedico.set(`${usuario.nombre} ${usuario.apellido}`);

        const usuarioId = usuario.id ?? usuario.idUsuario;

        this.medicoService.obtenerPorUsuario(usuarioId).subscribe({
          next: (medico) => {
            this.medicoActual.set(medico);

            const medicoId = medico.id ?? medico.idMedico;
            this.cargarCitasMedico(medicoId);
          },
          error: (err) => console.error('Error al obtener médico:', err)
        });
      },
      error: (err) => console.error('Error al obtener usuario:', err)
    });
  }

  cargarCitasMedico(medicoId: number): void {
    this.citaService.obtenerCitasMedico(medicoId).subscribe({
      next: (datos) => {
        this.citas.set(datos);
      },
      error: (err) => console.error('Error al cargar citas del médico:', err)
    });
  }
  atenderCita(cita: any): void {
  this.router.navigate(['/panel/medico/consulta', cita.id ?? cita.idCita]);
}

  citasDeHoy = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);

    return this.citas().filter(c =>
      c.fechaHora?.slice(0, 10) === hoy
    );
  });

  citasHoy = computed(() => this.citasDeHoy().length);

  pendientes = computed(() =>
    this.citasDeHoy().filter(c => c.estado === 'PENDIENTE').length
  );

  enAtencion = computed(() =>
    this.citasDeHoy().filter(c => c.estado === 'EN_ATENCION').length
  );

  completadas = computed(() =>
    this.citasDeHoy().filter(c => c.estado === 'COMPLETADA').length
  );
}