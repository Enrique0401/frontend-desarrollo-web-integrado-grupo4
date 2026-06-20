import { ClinicaEstado } from './enums.model';

export interface Clinica {
  idClinica: number;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: ClinicaEstado;
  planSuscripcion: string;
  fechaRegistro: string; // Angular maneja las fechas de BD como strings ISO
}
