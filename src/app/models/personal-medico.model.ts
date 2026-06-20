export interface Especialidad {
    idEspecialidad: number;
    nombre: string;
    descripcion?: string;
    activa: boolean;
  }
  
  export interface Medico {
    idMedico: number;
    usuarioId: number; 
    especialidadId: number;
    clinicaId: number;
    numeroColegiatura: string;
    activo: boolean;
  }
  
  export interface Consultorio {
    idConsultorio: number;
    nombre: string;
    ubicacion: string;
    capacidad: number;
    activo: boolean;
    clinicaId: number;
  }
  
  export interface HorarioMedico {
    idHorarioMedico: number;
    medicoId: number;
    clinicaId: number;
    diaSemana: string; // LUNES, MARTES, etc.
    horaInicio: string; 
    horaFin: string;
    duracionTurnoMinutos: number;
    activo: boolean;
  }