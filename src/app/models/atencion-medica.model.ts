import { CitaEstado } from './enums.model';

export interface Cita {
  idCita: number;
  pacienteId: number;
  medicoId: number;
  consultorioId: number;
  clinicaId: number;
  fechaHora: string; 
  fechaFin: string; 
  motivo: string;
  notas?: string;
  estado: CitaEstado;
}

export interface HistoriaClinica {
  idHistoriaClinica: number;
  pacienteId: number;
  clinicaId: number;
  fechaCreacion: string;
}

export interface ConsultaMedica {
  idConsultaMedica: number;
  citaId: number;
  historiaClinicaId: number;
  pacienteId: number;
  medicoId: number;
  clinicaId: number;
  fechaConsulta: string;
  anamnesis: string;
  diagnostico: string;
  examenFisico?: string;
  observaciones?: string;
  peso: number;
  talla: number;
  temperatura: number;
  presionArterial: string;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
}

export interface ArchivoClinico {
  idArchivoClinico: number;
  consultaMedicaId: number;
  tipoArchivo: string;
  rutaArchivo: string;
  nombreArchivo: string;
  descripcion?: string;
  fechaSubida: string;
}