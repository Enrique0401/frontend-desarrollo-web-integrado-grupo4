import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common'; // Importante para formatear la fecha_creacion

@Component({
  selector: 'app-administradores',
  standalone: true,
  imports: [DatePipe], // Lo inyectamos aquí
  templateUrl: './administradores.html',
  styleUrl: './administradores.scss',
})
export class Administradores implements OnInit {
  // Ahora la variable se llamará 'usuarios' para ser más precisos con tu imagen, 
  // pero mantendremos la misma URL de prueba.
  usuarios = signal<any[]>([]);
  mensaje = signal<string>('Esperando respuesta del servidor...');
  estado = signal<'cargando' | 'exito' | 'error'>('cargando');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.probarConexion();
  }

  probarConexion(): void {
    const token = localStorage.getItem('token');
    
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      this.mensaje.set('⚠️ No hay token en el navegador. Ve al login primero.');
      this.estado.set('error');
      return;
    }

    // Mantengo tu URL original de la prueba
    const url = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/pacientes';
    
    this.http.get<any[]>(url, { headers }).subscribe({
      next: (datosBD) => {
        this.usuarios.set(datosBD);
        this.estado.set('exito');
        this.mensaje.set(`¡Conexión Exitosa! Se cargaron ${datosBD.length} registros de la base de datos.`);
      },
      error: (err) => {
        this.estado.set('error');
        this.mensaje.set(`Error ${err.status}: Acceso denegado. Revisa tu token.`);
        console.error('Error de seguridad:', err);
      }
    });
  }
}