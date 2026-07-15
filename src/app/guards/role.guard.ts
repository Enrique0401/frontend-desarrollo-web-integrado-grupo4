import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  try {
    const partesToken = token.split('.');

    if (partesToken.length !== 3) {
      localStorage.removeItem('token');
      router.navigate(['/iniciar-sesion']);
      return false;
    }

    const payloadDecodificado = JSON.parse(atob(partesToken[1]));

    const rolDelToken = (payloadDecodificado.rol || '')
      .toString()
      .toUpperCase()
      .replace('ROLE_', '');

    const rolLocalStorage = (localStorage.getItem('rol') || '')
      .toString()
      .toUpperCase()
      .replace('ROLE_', '');

    const rolDelUsuario = rolDelToken || rolLocalStorage;

    const rolesPermitidos = ((route.data?.['roles'] || []) as string[])
      .map((rol) => rol.toUpperCase().replace('ROLE_', ''));

    if (rolesPermitidos.length === 0) {
      return true;
    }

    if (rolDelUsuario && rolesPermitidos.includes(rolDelUsuario)) {
      return true;
    }

    console.warn(`Acceso denegado: Tu rol es ${rolDelUsuario} y necesitas ${rolesPermitidos.join(', ')}`);
    router.navigate(['/']);
    return false;

  } catch (error) {
    console.error('Error al leer el token de seguridad', error);

    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('clinicaId');
    localStorage.removeItem('username');

    router.navigate(['/iniciar-sesion']);
    return false;
  }
};
