import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-atencion-triage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-triage.html',
  styleUrl: './atencion-triage.scss'
})
export class AtencionTriage implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  citaId!: number;
  citaData: any = null;
  historiaClinicaId!: number;

  // Datos para Historia Clínica (Permanentes del paciente)
  historiaClinica = {
    grupoSanguineo: '',
    alergias: '',
    contactoEmergencia: '',
    telefonoEmergencia: '',
    antecedentesPersonales: '',
    antecedentesFamiliares: ''
  };

  // Datos para Consulta Médica (Específicos de hoy)
  triage = {
    motivoAtencion: '',
    frecuenciaCardiaca: null,
    frecuenciaRespiratoria: null,
    peso: null,
    talla: null,
    temperatura: null,
    presionArterial: ''
  };

  guardando = false;

  ngOnInit() {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.citaId) {
      this.cargarDatosCitaYPaciente();
    }
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  cargarDatosCitaYPaciente() {
    const headers = this.obtenerHeaders();

    // 1. Buscamos la cita para saber quién es el paciente
    this.http.get<any>(`${this.urlBase}/citas/${this.citaId}`, { headers }).subscribe(cita => {
      this.citaData = cita;
      const pacienteId = cita.paciente?.id || cita.pacienteId;

      // 2. Buscamos al paciente para obtener su ID de historia clínica
      this.http.get<any>(`${this.urlBase}/pacientes/${pacienteId}`, { headers }).subscribe(paciente => {
        this.historiaClinicaId = paciente.historiaClinica?.id || paciente.historiaClinicaId;

        // 3. Traemos la historia clínica actual para que la enfermera vea si ya tiene alergias
        if (this.historiaClinicaId) {
          this.http.get<any>(`${this.urlBase}/historias-clinicas/${this.historiaClinicaId}`, { headers }).subscribe(hc => {
            this.historiaClinica.grupoSanguineo = hc.grupoSanguineo || '';
            this.historiaClinica.alergias = hc.alergias || '';
            this.historiaClinica.contactoEmergencia = hc.contactoEmergencia || '';
            this.historiaClinica.telefonoEmergencia = hc.telefonoEmergencia || '';
            this.historiaClinica.antecedentesPersonales = hc.antecedentesPersonales || '';
            this.historiaClinica.antecedentesFamiliares = hc.antecedentesFamiliares || '';
          });
        }
      });
    });
  }

  finalizarTriage() {
    this.guardando = true;
    const headers = this.obtenerHeaders();

    // 1. Actualizamos la Historia Clínica del Paciente (Aislado, solo afecta a este paciente)
    const payloadHC = { ...this.historiaClinica };
    const requestHC = this.http.patch(`${this.urlBase}/historias-clinicas/${this.historiaClinicaId}`, payloadHC, { headers });

    // 2. Creamos la base de la Consulta Médica con los signos vitales y motivo
    const hoyJava = new Date().toISOString().slice(0, 19);
    const payloadConsulta = {
      citaId: this.citaId,
      pacienteId: this.citaData.paciente?.id || this.citaData.pacienteId,
      medicoId: this.citaData.medico?.id || this.citaData.medicoId,
      clinicaId: 1,
      historiaClinicaId: this.historiaClinicaId,
      fechaConsulta: hoyJava,
      fechaActualizacion: hoyJava,
      anamnesis: `MOTIVO DE ATENCIÓN: ${this.triage.motivoAtencion}`,
      frecuenciaCardiaca: this.triage.frecuenciaCardiaca,
      frecuenciaRespiratoria: this.triage.frecuenciaRespiratoria,
      peso: this.triage.peso,
      talla: this.triage.talla,
      temperatura: this.triage.temperatura,
      presionArterial: this.triage.presionArterial
    };
    const requestConsulta = this.http.post(`${this.urlBase}/consultas`, payloadConsulta, { headers });

    // 3. Pasamos el estado de la cita a EN_ATENCION para habilitarla al doctor
    const payloadEstado = { estado: 'EN_ATENCION' };
    const requestEstado = this.http.patch(`${this.urlBase}/citas/${this.citaId}/estado`, payloadEstado, { headers });

    // Ejecutamos todo secuencialmente para no reventar la base de datos
    requestHC.subscribe({
      next: () => {
        requestConsulta.subscribe({
          next: () => {
            requestEstado.subscribe({
              next: () => {
                alert('Triage completado. El paciente está listo para el médico.');
                this.router.navigate(['/panel/enfermera/sala']);
              }
            });
          }
        });
      },
      error: (e) => {
        console.error('Error al guardar triage', e);
        this.guardando = false;
        alert('Ocurrió un error al procesar el triage.');
      }
    });
  }
}