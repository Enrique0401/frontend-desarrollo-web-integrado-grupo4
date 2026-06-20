import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario/usuario';

export const authGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  if (usuarioService.usuarioActual()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
}; 