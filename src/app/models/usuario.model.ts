import { Rol } from './enums.model';

export interface Usuario {
  idUsuario: number;
  username: string;
  correo: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  activo: boolean;
  clinicaId: number;
}