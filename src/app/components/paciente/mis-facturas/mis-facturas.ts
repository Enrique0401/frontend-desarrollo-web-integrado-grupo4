import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface PacientePerfil {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
}

interface DetalleFactura {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface Factura {
  id: number;
  numeroFactura: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  fechaEmision: string;
  fechaActualizacion: string;
  fechaPago?: string;
  pacienteId: number;
  citaId?: number;
  clinicaId: number;
  detalles: DetalleFactura[];
}

@Component({
  selector: 'app-mis-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-facturas.html',
  styleUrl: './mis-facturas.scss',
})
export class MisFacturas implements OnInit {
  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  cargando = true;
  error = '';

  paciente: PacientePerfil | null = null;
  facturas: Factura[] = [];
  facturaAbiertaId: number | null = null;

  ngOnInit(): void {
    this.cargarFacturas();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  cargarFacturas(): void {
    this.cargando = true;
    this.error = '';

    const headers = this.obtenerHeaders();

    this.http.get<PacientePerfil>(`${this.urlBase}/pacientes/perfil`, { headers }).subscribe({
      next: (paciente) => {
        this.paciente = paciente;

        this.http.get<Factura[]>(`${this.urlBase}/facturas/paciente/${paciente.id}`, { headers }).subscribe({
          next: (facturas) => {
            this.facturas = [...facturas].sort((a, b) =>
              new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime()
            );
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al cargar facturas', err);
            this.error = 'No se pudieron cargar tus facturas.';
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar perfil del paciente', err);
        this.error = 'No se pudo obtener la informacion del paciente.';
        this.cargando = false;
      }
    });
  }

  alternarDetalle(facturaId: number): void {
    this.facturaAbiertaId = this.facturaAbiertaId === facturaId ? null : facturaId;
  }

  estaAbierta(facturaId: number): boolean {
    return this.facturaAbiertaId === facturaId;
  }

  totalPendiente(): number {
    return this.facturas
      .filter((factura) => factura.estado === 'PENDIENTE')
      .reduce((total, factura) => total + Number(factura.total || 0), 0);
  }

  estadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PAGADA: 'Pagada',
      ANULADA: 'Anulada'
    };

    return textos[estado] ?? estado;
  }

  metodoPagoTexto(metodoPago: string): string {
    const textos: Record<string, string> = {
      EFECTIVO: 'Efectivo',
      TARJETA: 'Tarjeta',
      TRANSFERENCIA: 'Transferencia'
    };

    return textos[metodoPago] ?? metodoPago;
  }
}