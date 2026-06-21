import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  try {
    const payloadDecodificado = JSON.parse(atob(token.split('.')[1]));
    const rolDelUsuario = payloadDecodificado.rol;

    const rolesPermitidos = route.data['roles'] as Array<string>;

    if (rolDelUsuario && rolesPermitidos.includes(rolDelUsuario)) {
      return true;
    }

    console.warn(`Acceso denegado: Tu rol es ${rolDelUsuario} y necesitas ${rolesPermitidos}`);
    router.navigate(['/']); 
    return false;

  } catch (error) {
    console.error('Error al leer el token de seguridad', error);
    router.navigate(['/iniciar-sesion']);
    return false;
  }
};