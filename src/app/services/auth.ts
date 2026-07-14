import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esRutaAuth =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register');

  if (esRutaAuth) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const requestConToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestConToken);
};
