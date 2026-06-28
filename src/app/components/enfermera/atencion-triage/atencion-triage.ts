import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';

interface CitaApi {
  id: number;
  pacienteId: number;
  medicoId: number;
  clinicaId: number;
  fechaHora: string;
}

interface PacienteApi {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
  telefono?: string;
  clinicaId?: number;
  usuarioId?: number;
  grupoSanguineo?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  alergias?: string;
  antecedentesPersonales?: string;
  antecedentesFamiliares?: string;
}

interface HistoriaClinicaApi {
  id: number;
  pacienteId: number;
  clinicaId: number;
  fechaCreacion: string;
}

interface ConsultaMedicaApi {
  id?: number;
  historiaClinicaId?: number;
  anamnesis?: string;
  examenFisico?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  presionArterial?: string;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  peso?: number;
  talla?: number;
  fechaConsulta?: string;
  fechaActualizacion?: string;
}

@Component({
  selector: 'app-atencion-triage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atencion-triage.html',
  styleUrl: './atencion-triage.scss',
})
export class AtencionTriage implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private urlBase = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';

  cita: CitaApi | null = null;
  paciente: PacienteApi | null = null;
  historiaClinica: HistoriaClinicaApi | null = null;
  consultaActual: ConsultaMedicaApi | null = null;

  grupoSanguineoOpciones = [
    { value: 'A_POSITIVO', label: 'A+' },
    { value: 'A_NEGATIVO', label: 'A-' },
    { value: 'B_POSITIVO', label: 'B+' },
    { value: 'B_NEGATIVO', label: 'B-' },
    { value: 'AB_POSITIVO', label: 'AB+' },
    { value: 'AB_NEGATIVO', label: 'AB-' },
    { value: 'O_POSITIVO', label: 'O+' },
    { value: 'O_NEGATIVO', label: 'O-' },
  ];

  form = this.fb.group({
    frecuenciaCardiaca: ['', [Validators.required, Validators.min(0), Validators.max(300)]],
    frecuenciaRespiratoria: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    peso: ['', [Validators.required, Validators.min(0), Validators.max(500)]],
    talla: ['', [Validators.required, Validators.min(0), Validators.max(3)]],
    temperatura: ['', [Validators.required, Validators.min(30), Validators.max(45)]],
    presionArterial: ['', [Validators.required, Validators.maxLength(20)]],
    fechaConsulta: [this.toDateTimeLocal(new Date()), Validators.required],
    grupoSanguineo: ['', Validators.required],
    telefonoEmergencia: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    contactoEmergencia: ['', Validators.required],
    alergias: [''],
    antecedentesFamiliares: [''],
    antecedentesPersonales: [''],
  });

  ngOnInit() {
    const idDesdeRuta = Number(this.route.snapshot.paramMap.get('idCita'));
    const idDesdeUrl = Number(this.router.url.split('/').pop());
    const idCita = idDesdeRuta || idDesdeUrl;

    if (!idCita) {
      this.error = 'No se recibio el ID de la cita.';
      this.cargando = false;
      return;
    }

    this.cargarDatos(idCita);
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private cargarDatos(citaId: number) {
    this.cargando = true;
    this.error = '';

    const headers = this.obtenerHeaders();

    this.http.get<CitaApi>(`${this.urlBase}/citas/${citaId}`, { headers }).pipe(
      switchMap((cita) => {
        this.cita = cita;

        return forkJoin({
          paciente: this.http.get<PacienteApi>(`${this.urlBase}/pacientes/${cita.pacienteId}`, { headers }),
          historiaClinica: this.http.get<HistoriaClinicaApi>(`${this.urlBase}/historia-clinica/paciente/${cita.pacienteId}`, { headers }),
          consulta: this.http.get<ConsultaMedicaApi>(`${this.urlBase}/consulta-medica/cita/${cita.id}`, { headers })
            .pipe(catchError(() => of(null)))
        });
      }),
      finalize(() => this.cargando = false)
    ).subscribe({
      next: ({ paciente, historiaClinica, consulta }) => {
        this.paciente = paciente;
        this.historiaClinica = historiaClinica;
        this.consultaActual = consulta;
        this.rellenarFormulario(paciente, consulta);
      },
      error: (err) => {
        console.error('Error al cargar triage', err);
        this.error = 'No se pudo cargar la informacion del triage.';
      }
    });
  }

  private rellenarFormulario(paciente: PacienteApi, consulta: ConsultaMedicaApi | null) {
    this.form.patchValue({
      frecuenciaCardiaca: consulta?.frecuenciaCardiaca?.toString() ?? '',
      frecuenciaRespiratoria: consulta?.frecuenciaRespiratoria?.toString() ?? '',
      peso: consulta?.peso?.toString() ?? '',
      talla: consulta?.talla?.toString() ?? '',
      temperatura: consulta?.temperatura?.toString() ?? '',
      presionArterial: consulta?.presionArterial ?? '',
      fechaConsulta: this.toDateTimeLocal(consulta?.fechaConsulta ?? new Date()),
      grupoSanguineo: paciente.grupoSanguineo ?? '',
      telefonoEmergencia: paciente.telefonoEmergencia ?? '',
      contactoEmergencia: paciente.contactoEmergencia ?? '',
      alergias: paciente.alergias ?? '',
      antecedentesFamiliares: paciente.antecedentesFamiliares ?? '',
      antecedentesPersonales: paciente.antecedentesPersonales ?? '',
    });
  }

  guardarTriage() {
    if (!this.cita || !this.paciente) return;

    if (!this.historiaClinica?.id && !this.consultaActual?.historiaClinicaId) {
      this.error = 'No se pudo obtener la historia clinica del paciente.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    const valor = this.form.getRawValue();
    const headers = this.obtenerHeaders();

    const pacientePayload = {
      ...this.paciente,
      grupoSanguineo: valor.grupoSanguineo,
      telefonoEmergencia: valor.telefonoEmergencia,
      contactoEmergencia: valor.contactoEmergencia,
      alergias: valor.alergias,
      antecedentesFamiliares: valor.antecedentesFamiliares,
      antecedentesPersonales: valor.antecedentesPersonales,
    };

    const consultaPayload = {
      historiaClinicaId: this.consultaActual?.historiaClinicaId ?? this.historiaClinica?.id,
      pacienteId: this.cita.pacienteId,
      medicoId: this.cita.medicoId,
      citaId: this.cita.id,
      clinicaId: this.cita.clinicaId ?? this.paciente.clinicaId,
      anamnesis: this.consultaActual?.anamnesis || 'Registro de triage',
      examenFisico: this.consultaActual?.examenFisico || 'Signos vitales registrados en triage',
      diagnostico: this.consultaActual?.diagnostico || 'Pendiente de evaluacion medica',
      tratamiento: this.consultaActual?.tratamiento || 'Pendiente de evaluacion medica',
      observaciones: this.consultaActual?.observaciones || 'Triage registrado por enfermeria',
      presionArterial: valor.presionArterial,
      temperatura: this.toNumber(valor.temperatura),
      frecuenciaCardiaca: this.toNumber(valor.frecuenciaCardiaca),
      frecuenciaRespiratoria: this.toNumber(valor.frecuenciaRespiratoria),
      peso: this.toNumber(valor.peso),
      talla: this.toNumber(valor.talla),
      fechaConsulta: this.toBackendDateTime(valor.fechaConsulta),
      fechaActualizacion: this.toBackendDateTime(this.toDateTimeLocal(new Date())),
    };

    const consultaRequest = this.consultaActual?.id
      ? this.http.put<ConsultaMedicaApi>(`${this.urlBase}/consulta-medica/${this.consultaActual.id}`, consultaPayload, { headers })
      : this.http.post<ConsultaMedicaApi>(`${this.urlBase}/consulta-medica`, consultaPayload, { headers });

    forkJoin({
      paciente: this.http.put<PacienteApi>(`${this.urlBase}/pacientes/${this.paciente.id}`, pacientePayload, { headers }),
      consulta: consultaRequest
    }).pipe(
      finalize(() => this.guardando = false)
    ).subscribe({
      next: ({ paciente, consulta }) => {
        this.paciente = paciente;
        this.consultaActual = consulta;
        this.mensaje = 'Triage registrado correctamente.';
      },
      error: (err) => {
        console.error('Error al guardar triage', err);
        this.error = 'No se pudo guardar el triage. Revisa los campos obligatorios.';
      }
    });
  }

  volverSala() {
    this.router.navigate(['/panel/enfermeria/sala-espera']);
  }

  campoInvalido(nombre: string): boolean {
    const control = this.form.get(nombre);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private toNumber(value: unknown): number | null {
    const numero = Number(value);
    return Number.isFinite(numero) ? numero : null;
  }

  private toDateTimeLocal(value: string | Date | null | undefined): string {
    if (!value) return this.toDateTimeLocal(new Date());

    if (typeof value === 'string') {
      return value.slice(0, 16);
    }

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }

  private toBackendDateTime(value: string | null | undefined): string {
    if (!value) return this.toDateTimeLocal(new Date()) + ':00';
    return value.length === 16 ? `${value}:00` : value;
  }
}