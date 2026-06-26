import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admision-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admision-pacientes.html',
  styleUrl: './admision-pacientes.scss',
})
export class AdmisionPacientes implements OnInit {
  private http = inject(HttpClient);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api/pacientes';

  paciente = { nombre: '', apellido: '', numeroDocumento: '', genero: 'MASCULINO', seguroMedico: 'SIS' };
  mensaje: string = '';
  error: string = '';

  ngOnInit() { }

  registrarPaciente() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

    this.http.post(this.urlBase, this.paciente, { headers }).subscribe({
      next: () => {
        this.mensaje = 'Paciente admitido exitosamente.';
        this.paciente = { nombre: '', apellido: '', numeroDocumento: '', genero: 'MASCULINO', seguroMedico: 'SIS' };
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: () => this.error = 'Error al registrar paciente. Verifique los datos.'
    });
  }
}