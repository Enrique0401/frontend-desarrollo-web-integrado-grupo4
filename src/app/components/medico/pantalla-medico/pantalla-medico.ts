import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from '../../../services/usuario/usuario';
import { MedicoService } from '../../../services/medico/medico';
import { CitaService } from '../../../services/cita/cita';

@Component({
  selector: 'app-pantalla-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pantalla-medico.html',
  styleUrl: './pantalla-medico.scss',
})
export class PantallaMedico implements OnInit {
  nombreMedico = signal('Médico');

  usuarioActual = signal<any | null>(null);
  medicoActual = signal<any | null>(null);
  citas = signal<any[]>([]);

  terminoBusqueda = signal('');

  constructor(
    private usuarioService: UsuarioService,
    private medicoService: MedicoService,
    private citaService: CitaService,
    private router: Router,
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
          error: (err) => console.error('Error al obtener médico:', err),
        });
      },
      error: (err) => console.error('Error al obtener usuario:', err),
    });
  }

  cargarCitasMedico(medicoId: number): void {
    this.citaService.obtenerCitasMedico(medicoId).subscribe({
      next: (datos) => {
        console.log('CITAS DEL MEDICO:', datos);
        this.citas.set(datos);
      },
      error: (err) => console.error('Error al cargar citas del médico:', err),
    });
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value.toLowerCase().trim());
  }

  citasFiltradas = computed(() => {
    const texto = this.terminoBusqueda();

    return this.citas().filter((c) => {
      const paciente = `${c.pacienteNombre ?? ''} ${c.pacienteApellido ?? ''}`.toLowerCase();
      const estado = `${c.estado ?? ''}`.toLowerCase();
      const motivo = `${c.motivo ?? ''}`.toLowerCase();

      return paciente.includes(texto) || estado.includes(texto) || motivo.includes(texto);
    });
  });

  citasDeHoy = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);

    return this.citas().filter((c) => c.fechaHora?.slice(0, 10) === hoy);
  });

  citasHoy = computed(() => this.citas().length);

  pendientes = computed(
    () => this.citas().filter((c) => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA').length,
  );

  enAtencion = computed(
    () => this.citas().filter((c) => c.estado === 'EN_ATENCION' || c.estado === 'ATENDIDA').length,
  );

  completadas = computed(
    () => this.citas().filter((c) => c.estado === 'COMPLETADA' || c.estado === 'FINALIZADA').length,
  );

  atenderCita(cita: any): void {
    const idCita = cita.id ?? cita.idCita ?? cita.id_cita;

    if (!idCita) {
      console.error('Cita sin ID:', cita);
      alert('No se encontró el ID de la cita.');
      return;
    }

    const citaActualizada = {
      ...cita,
      estado: 'EN_ATENCION',
    };

    this.citaService.actualizarCita(idCita, citaActualizada).subscribe({
      next: (citaActualizadaBD) => {
        const citasActualizadas = this.citas().map((c) =>
          (c.id ?? c.idCita ?? c.id_cita) === idCita ? citaActualizadaBD : c,
        );

        this.citas.set(citasActualizadas);

        this.router.navigate(['/panel/medico/consulta', idCita]);
      },
      error: (err) => {
        console.error('Error al cambiar cita a EN_ATENCION:', err);
        alert('No se pudo iniciar la atención.');
      },
    });

    this.router.navigate(['/panel/medico/consulta', idCita]);
  }
}
