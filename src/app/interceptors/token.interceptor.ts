import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const esRutaAuth =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register');

  if (esRutaAuth) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token) {
    const reqClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(reqClonada);
  }

  return next(req);
};
