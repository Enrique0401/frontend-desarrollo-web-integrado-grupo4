import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // 1. Si no hay token (no ha iniciado sesión), lo botamos
  if (!token) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  try {
    // 2. Abrimos el token para ver qué rol tiene adentro
    const payloadDecodificado = JSON.parse(atob(token.split('.')[1]));
    const rolUsuario = payloadDecodificado.rol;

    // 3. Si es Super Admin, le abrimos la puerta
    if (rolUsuario === 'SUPER_ADMIN') {
      return true;
    }
  } catch (error) {
    console.error('El token está corrupto o alterado', error);
  }

  // 4. Si intentó entrar siendo Médico, Paciente o alteró su token, lo botamos
  router.navigate(['/iniciar-sesion']);
  return false;
};