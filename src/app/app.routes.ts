/* import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

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
    canActivate: [authGuard], // Nadie entra a este bloque si no está autenticado
    children: [

      // --- DASHBOARD GENÉRICO ---
      // Pantalla comodín (por si un usuario no tiene un flujo asignado o para redirección por defecto)
      {
        path: 'dashboard',
        loadComponent: () => import('./components/privado/dashboard-generico/dashboard-generico.component').then(m => m.DashboardGenericoComponent)
      },

      // --- ZONA: SUPER_ADMIN ---
      {
        path: 'super-admin',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] as Rol[] },
        loadComponent: () => import('./components/privado/super-admin/inicio/inicio.component').then(m => m.InicioSuperAdminComponent)
      },

      // --- ZONA: ADMIN_CLINICA ---
      {
        path: 'clinica',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_CLINICA'] as Rol[] },
        loadComponent: () => import('./components/privado/admin-clinica/gestion/gestion.component').then(m => m.GestionClinicaComponent)
      },

      // --- ZONA: RECEPCIONISTA ---
      {
        path: 'recepcion',
        canActivate: [roleGuard],
        data: { roles: ['RECEPCIONISTA'] as Rol[] },
        loadComponent: () => import('./components/privado/recepcion/agenda/agenda.component').then(m => m.AgendaComponent)
      },

      // --- ZONA: MÉDICO Y ENFERMERA (Pueden compartir ciertas pantallas) ---
      {
        path: 'atencion',
        canActivate: [roleGuard],
        data: { roles: ['MEDICO', 'ENFERMERA'] as Rol[] },
        loadComponent: () => import('./components/privado/personal-salud/consultas/consultas.component').then(m => m.ConsultasComponent)
      },

      // --- ZONA: PACIENTE ---
      {
        path: 'paciente',
        canActivate: [roleGuard],
        data: { roles: ['PACIENTE'] as Rol[] },
        loadComponent: () => import('./components/paciente/dashboard-paciente/dashboard-paciente').then(m => m.DashboardPaciente)
      }
    ]
  },
  { path: '**', redirectTo: '' }
]; */


import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // RUTAS PÚBLICAS
  {
    path: '',
    loadComponent: () =>
      import('./components/publico/panel-general.component/panel-general.component')
        .then(m => m.PanelGeneralComponent)
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./components/loguin/iniciar-sesion.component/iniciar-sesion.component')
        .then(m => m.IniciarSesionComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/loguin/registro.component/registro.component')
        .then(m => m.RegistroComponent)
  },
  {
    path: 'personal-medico',
    loadComponent: () =>
      import('./components/publico/medicos.component/medicos.component')
        .then(m => m.MedicosComponent)
  },
  {
    path: 'conocenos',
    loadComponent: () =>
      import('./components/publico/conocenos.component/conocenos.component')
        .then(m => m.ConocenosComponent)
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./components/publico/contacto.component/contacto.component')
        .then(m => m.ContactoComponent)
  },
  { path: '**', redirectTo: '' }
];