export interface Medicamento {
    idMedicamento: number;
    nombreComercial: string;
    nombreGenerico: string;
    concentracion: string;
    presentacion: string;
    viaAdministracion: string;
    activo: boolean;
  }
  
  export interface Receta {
    idReceta: number;
    consultaMedicaId: number;
    pacienteId: number;
    medicoId: number;
    fechaEmision: string;
    indicaciones?: string;
  }
  
  export interface DetalleReceta {
    idDetalleReceta: number;
    recetaId: number;
    medicamentoId: number;
    dosis: string;
    frecuencia: string;
    duracion: string;
    instrucciones?: string;
  }