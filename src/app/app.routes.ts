import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export type Rol =
  | 'SUPER_ADMIN'
  | 'ADMIN_CLINICA'
  | 'RECEPCIONISTA'
  | 'MEDICO'
  | 'ENFERMERA'
  | 'PACIENTE';

export const routes: Routes = [
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================
  {
    path: '',
    loadComponent: () =>
      import('./components/publico/panel-general.component/panel-general.component').then(
        (m) => m.PanelGeneralComponent,
      ),
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./components/loguin/iniciar-sesion.component/iniciar-sesion.component').then(
        (m) => m.IniciarSesionComponent,
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/loguin/registro.component/registro.component').then(
        (m) => m.RegistroComponent,
      ),
  },
  {
    path: 'personal-medico',
    loadComponent: () =>
      import('./components/publico/medicos.component/medicos.component').then(
        (m) => m.MedicosComponent,
      ),
  },
  {
    path: 'conocenos',
    loadComponent: () =>
      import('./components/publico/conocenos.component/conocenos.component').then(
        (m) => m.ConocenosComponent,
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./components/publico/contacto.component/contacto.component').then(
        (m) => m.ContactoComponent,
      ),
  },

  // ==========================================
  // RUTAS PRIVADAS
  // ==========================================
  {
    path: 'panel',
    canActivate: [authGuard],
    children: [
      // ======================================
      // ZONA: SUPER_ADMIN
      // ======================================
      {
        path: 'super-admin',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] as Rol[] },
        loadComponent: () =>
          import('./components/super-admin/nav-super-admin/nav-super-admin').then(
            (m) => m.NavSuperAdmin,
          ),

        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./components/super-admin/pantalla-super-admin/pantalla-super-admin').then(
                (m) => m.PantallaSuperAdmin,
              ),
          },
          {
            path: 'clinicas',
            loadComponent: () =>
              import('./components/super-admin/clinicas/clinicas').then((m) => m.Clinicas),
          },
          {
            path: 'administradores',
            loadComponent: () =>
              import('./components/super-admin/administradores/administradores').then(
                (m) => m.Administradores,
              ),
          },
          {
            path: 'agregar-clinica',
            loadComponent: () =>
              import('./components/super-admin/agregar-clinica/agregar-clinica').then(
                (m) => m.AgregarClinica,
              ),
          },
          {
            path: 'editar-clinica/:id',
            loadComponent: () =>
              import('./components/super-admin/agregar-clinica/agregar-clinica').then(
                (m) => m.AgregarClinica,
              ),
          },
        ],
      },

      // ======================================
      // ZONA: ADMIN_CLINICA
      // ======================================
      {
        path: 'admin-clinica',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_CLINICA'] as Rol[] },
        loadComponent: () =>
          import('./components/admin-clinica/nav-admin-clinica/nav-admin-clinica').then(
            (m) => m.NavAdminClinica,
          ),
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./components/admin-clinica/pantalla-admin-clinica/pantalla-admin-clinica').then(
                (m) => m.PantallaAdminClinica,
              ),
          },
          {
            path: 'personal',
            loadComponent: () =>
              import('./components/admin-clinica/personal/personal').then((m) => m.Personal),
          },
          {
            path: 'horarios',
            loadComponent: () =>
              import('./components/admin-clinica/horarios/horarios').then((m) => m.Horarios),
          },
          {
            path: 'agregar-personal',
            loadComponent: () =>
              import('./components/admin-clinica/agregar-personal/agregar-personal').then(
                (m) => m.AgregarPersonal,
              ),
          },
          {
            path: 'editar-personal/:id',
            loadComponent: () =>
              import('./components/admin-clinica/agregar-personal/agregar-personal').then(
                (m) => m.AgregarPersonal,
              ),
          },
        ],
      },

      // ======================================
      // ZONA: RECEPCIONISTA
      // ======================================
      {
        path: 'recepcion',
        canActivate: [roleGuard],
        data: { roles: ['RECEPCIONISTA'] as Rol[] },
        loadComponent: () =>
          import('./components/recepcionista/pantalla-recepcionista/pantalla-recepcionista').then(
            (m) => m.PantallaRecepcionista,
          ),
      },

      // ======================================
      // ZONA: MÉDICO / ENFERMERA
      // ======================================
      {
        path: 'medico',
        canActivate: [roleGuard],
        data: { roles: ['MEDICO', 'ENFERMERA'] as Rol[] },
        loadComponent: () =>
          import('./components/medico/pantalla-medico/pantalla-medico').then(
            (m) => m.PantallaMedico,
          ),
      },

      // ======================================
      // ZONA: ENFERMERA
      // ======================================
      {
        path: 'enfermeria',
        canActivate: [roleGuard],
        data: { roles: ['ENFERMERA'] as Rol[] },
        loadComponent: () =>
          import('./components/enfermera/pantalla-enfermera/pantalla-enfermera').then(
            (m) => m.PantallaEnfermera,
          ),
      },

      // ======================================
      // ZONA: PACIENTE
      // ======================================
      {
        path: 'paciente',
        canActivate: [roleGuard],
        data: { roles: ['PACIENTE'] as Rol[] },
        loadComponent: () =>
          import('./components/paciente/pantalla-paciente/pantalla-paciente').then(
            (m) => m.PantallaPaciente,
          ),

        children: [
          {
            path: '',
            redirectTo: 'datos-paciente',
            pathMatch: 'full',
          },
          {
            path: 'datos-paciente',
            loadComponent: () =>
              import('./components/paciente/datos-paciente/datos-paciente').then(
                (m) => m.DatosPaciente,
              ),
          },
          {
            path: 'citas',
            loadComponent: () =>
              import('./components/paciente/mis-citas/mis-citas').then((m) => m.MisCitas),
          },
          {
            path: 'historial-clinico',
            loadComponent: () =>
              import('./components/paciente/mi-historia-clinica/mi-historia-clinica').then(
                (m) => m.MiHistoriaClinica,
              ),
          },
          {
            path: 'recetas',
            loadComponent: () =>
              import('./components/paciente/mis-recetas/mis-recetas').then((m) => m.MisRecetas),
          },
          {
            path: 'archivos-clinicos',
            loadComponent: () =>
              import('./components/paciente/mis-archivos-clinicos/mis-archivos-clinicos').then(
                (m) => m.MisArchivosClinicos,
              ),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
