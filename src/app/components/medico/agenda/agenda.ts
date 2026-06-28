import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from '../../../services/usuario/usuario';
import { MedicoService } from '../../../services/medico/medico';
import { CitaService } from '../../../services/cita/cita';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss'
})
export class Agenda implements OnInit {
  nombreMedico = signal('Médico');
  medicoActual = signal<any | null>(null);
  citas = signal<any[]>([]);

  terminoBusqueda = signal('');
  filtroEstado = signal('TODOS');
  filtroFecha = signal('');

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
    if (!username) return;

    this.usuarioService.obtenerPorUsername(username).subscribe({
      next: (usuario) => {
        this.nombreMedico.set(`${usuario.nombre} ${usuario.apellido}`);
        const usuarioId = usuario.id ?? usuario.idUsuario;

        this.medicoService.obtenerPorUsuario(usuarioId).subscribe({
          next: (medico) => {
            this.medicoActual.set(medico);
            const medicoId = medico.id ?? medico.idMedico;
            this.cargarCitasMedico(medicoId);
          }
        });
      }
    });
  }

  cargarCitasMedico(medicoId: number): void {
    this.citaService.obtenerCitasMedico(medicoId).subscribe({
      next: (datos) => this.citas.set(datos),
      error: (err) => console.error('Error al cargar agenda:', err)
    });
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value.toLowerCase().trim());
  }

  cambiarEstado(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value);
  }

  cambiarFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFecha.set(input.value);
  }

  citasFiltradas = computed(() => {
    const texto = this.terminoBusqueda();
    const estado = this.filtroEstado();
    const fecha = this.filtroFecha();

    return this.citas().filter(c => {
      const paciente = `${c.pacienteNombre ?? ''} ${c.pacienteApellido ?? ''}`.toLowerCase();
      const motivo = `${c.motivo ?? ''}`.toLowerCase();

      const coincideTexto =
        paciente.includes(texto) ||
        motivo.includes(texto) ||
        `${c.estado ?? ''}`.toLowerCase().includes(texto);

      const coincideEstado =
        estado === 'TODOS' || c.estado === estado;

      const coincideFecha =
        !fecha || c.fechaHora?.slice(0, 10) === fecha;

      return coincideTexto && coincideEstado && coincideFecha;
    });
  });

  irConsulta(cita: any): void {
    const idCita = cita.id ?? cita.idCita ?? cita.id_cita;
    if (!idCita) return;

    const citaActualizada = {
      ...cita,
      estado: cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA'
        ? 'EN_ATENCION'
        : cita.estado
    };

    this.citaService.actualizarCita(idCita, citaActualizada).subscribe({
      next: () => this.router.navigate(['/panel/medico/consulta', idCita]),
      error: () => this.router.navigate(['/panel/medico/consulta', idCita])
    });
  }

  textoBoton(cita: any): string {
    if (cita.estado === 'COMPLETADA' || cita.estado === 'FINALIZADA') return 'Ver consulta';
    if (cita.estado === 'EN_ATENCION' || cita.estado === 'ATENDIDA') return 'Continuar';
    return 'Atender';
  }
}