import { TipoDocumento, Genero, GrupoSanguineo, SeguroMedico } from './enums.model';

export interface Paciente {
  idPaciente: number;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  genero: Genero;
  grupoSanguineo?: GrupoSanguineo;
  seguroMedico?: SeguroMedico;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  alergias?: string;
  antecedentesPersonales?: string;
  antecedentesFamiliares?: string;
  clinicaId: number;
  usuarioId?: number; 
}