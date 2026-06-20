import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Factura } from '../../models/facturacion.model';

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private _facturas = signal<Factura[]>([]);
  public facturas = computed(() => this._facturas());

  constructor() {
    this._facturas.set([{ idFactura: 1, pacienteId: 1, clinicaId: 1, numeroFactura: 'F001-00001', fechaEmision: '2026-06-18', metodoPago: 'EFECTIVO', subtotal: 100, impuesto: 18, total: 118, estado: 'PENDIENTE' }]);
  }

  obtenerFacturas(): Observable<Factura[]> {
    return of(this._facturas()).pipe(delay(500));
  }
}