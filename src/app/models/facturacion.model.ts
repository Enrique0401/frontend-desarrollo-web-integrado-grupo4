import { FacturaEstado, MetodoPago } from './enums.model';

export interface Factura {
  idFactura: number;
  pacienteId: number;
  clinicaId: number;
  citaId?: number;
  numeroFactura: string;
  fechaEmision: string;
  fechaPago?: string;
  metodoPago: MetodoPago;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: FacturaEstado;
}

export interface DetalleFactura {
  idDetalleFactura: number;
  facturaId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}