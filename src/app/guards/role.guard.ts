import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario/usuario';
import { Rol } from '../models/enums.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);
  const usuario = usuarioService.usuarioActual();

  // Obtenemos los roles permitidos desde la configuración de la ruta
  const rolesPermitidos = route.data['roles'] as Array<Rol>;

  if (usuario && rolesPermitidos.includes(usuario.rol)) {
    return true;
  }

  // Si no tiene el rol, lo mandamos a un dashboard genérico o de error
  console.warn('Acceso denegado: No tienes el rol necesario para esta vista.');
  router.navigate(['/app/dashboard']);
  return false;
};