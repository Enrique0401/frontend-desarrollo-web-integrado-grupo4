import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
export type Rol = 'SUPER_ADMIN' | 'ADMIN_CLINICA' | 'RECEPCIONISTA' | 'MEDICO' | 'ENFERMERA' | 'PACIENTE';

export const routes: Routes = [
  // RUTAS PÚBLICAS 
  {
    path: '',
    // Esta es la Landing Page libre que verá cualquier persona (con mapas, sedes, etc.)
    loadComponent: () => import('./components/publico/panel-general.component/panel-general.component').then(m => m.PanelGeneralComponent)
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./components/loguin/iniciar-sesion.component/iniciar-sesion.component').then(m => m.IniciarSesionComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/loguin/registro.component/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'personal-medico',
    loadComponent: () => import('./components/publico/medicos.component/medicos.component').then(m => m.MedicosComponent)
  },
  {
    path: 'conocenos',
    loadComponent: () => import('./components/publico/conocenos.component/conocenos.component').then(m => m.ConocenosComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./components/publico/contacto.component/contacto.component').then(m => m.ContactoComponent)
  },

  // RUTAS PRIVADAS (requieren autenticación)
  {
    path: 'panel',
    canActivate: [authGuard],
    children: [
      
      // --- ZONA: SUPER_ADMIN ---
      {
        path: 'super-admin',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] as Rol[] }, // ¡Ahora TypeScript ya sabe qué es Rol!
        loadComponent: () => import('./components/super-admin/pantalla-super-admin/pantalla-super-admin').then(m => m.PantallaSuperAdmin)
      },
      // --- ZONA: ADMIN_CLINICA ---
      {
        path: 'admin-clinica',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_CLINICA'] as Rol[] },
        loadComponent: () => import('./components/admin-clinica/pantalla-admin-clinica/pantalla-admin-clinica').then(m => m.PantallaAdminClinica)
      },

      // --- ZONA: RECEPCIONISTA ---
      {
        path: 'recepcion',
        canActivate: [roleGuard],
        data: { roles: ['RECEPCIONISTA'] as Rol[] },
        loadComponent: () => import('./components/recepcionista/pantalla-recepcionista/pantalla-recepcionista').then(m => m.PantallaRecepcionista)
      },

      // --- ZONA: MÉDICO Y ENFERMERA (Pueden compartir ciertas pantallas) ---
      {
        path: 'medico',
        canActivate: [roleGuard],
        data: { roles: ['MEDICO', 'ENFERMERA'] as Rol[] },
        loadComponent: () => import('./components/medico/pantalla-medico/pantalla-medico').then(m => m.PantallaMedico)
      },

      // --- ZONA: PACIENTE ---
      {
        path: 'paciente',
        canActivate: [roleGuard],
        data: { roles: ['PACIENTE'] as Rol[] },
        loadComponent: () => import('./components/paciente/pantalla-paciente/pantalla-paciente').then(m => m.PantallaPaciente)
      }

    ]
  },
  { path: '**', redirectTo: '' }
];




// --- DASHBOARD GENÉRICO ---
// Pantalla comodín (por si un usuario no tiene un flujo asignado o para redirección por defecto)
/* {
  path: 'dashboard',
  loadComponent: () => import('./components/privado/dashboard-generico/dashboard-generico.component').then(m => m.DashboardGenericoComponent)
}, */
