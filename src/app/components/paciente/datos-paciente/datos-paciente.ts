import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as L from 'leaflet';

export type SeguroMedico = 'ESSALUD' | 'SIS' | 'EPS' | 'PRIVADO' | 'NINGUNO';
type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO';

@Component({
  selector: 'app-datos-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './datos-paciente.html',
  styleUrl: './datos-paciente.scss',
})
export class DatosPaciente implements OnInit {
  paciente: any = null;
  cargando = true;
  guardando = false;
  editando = false;
  errorMensaje = '';
  exitoMensaje = '';

  mostrarConfirmacion = false;

  mapaAbierto = false;
  direccionMapa = '';
  buscandoDireccion = false;

  private mapa: L.Map | null = null;
  private marcador: L.Marker | null = null;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  private urlBackend = 'https://backend-desarrollo-web-integrado-grupo4.onrender.com/api';

  generos = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMENINO', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro' },
  ];

  seguros: { value: SeguroMedico; label: string }[] = [
    { value: 'ESSALUD', label: 'EsSalud' },
    { value: 'SIS', label: 'SIS' },
    { value: 'EPS', label: 'EPS' },
    { value: 'PRIVADO', label: 'Privado' },
    { value: 'NINGUNO', label: 'Ninguno' },
  ];

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    genero: ['', Validators.required],
    seguroMedico: ['', Validators.required],
    numeroSeguro: [''],
  });

  ngOnInit() {
    this.form.disable();
    this.obtenerMiPerfil();

    this.form.get('seguroMedico')?.valueChanges.subscribe(() => {
      this.actualizarValidacionSeguro();
    });
  }

  private obtenerHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  obtenerMiPerfil() {
    this.cargando = true;
    this.errorMensaje = '';

    this.http.get(`${this.urlBackend}/pacientes/perfil`, { headers: this.obtenerHeaders() }).subscribe({
      next: (data: any) => {
        this.paciente = data;
        this.rellenarFormulario();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al conectar con el servidor:', error);
        this.errorMensaje = 'No se pudo cargar tu información. Intenta nuevamente más tarde.';
        this.cargando = false;
      }
    });
  }

  rellenarFormulario() {
    if (!this.paciente) return;

    this.form.patchValue({
      nombre: this.paciente.nombre ?? '',
      apellido: this.paciente.apellido ?? '',
      correo: this.paciente.correo ?? '',
      telefono: this.paciente.telefono ?? '',
      direccion: this.paciente.direccion ?? '',
      genero: this.paciente.genero ?? '',
      seguroMedico: this.paciente.seguroMedico ?? '',
      numeroSeguro: this.paciente.numeroSeguro ?? '',
    });

    this.form.markAsPristine();
    this.actualizarValidacionSeguro();
  }

  actualizarValidacionSeguro() {
    const seguro = this.form.get('seguroMedico')?.value;
    const numeroSeguro = this.form.get('numeroSeguro');

    if (!numeroSeguro) return;

    if (seguro && seguro !== 'NINGUNO') {
      numeroSeguro.setValidators([Validators.required, Validators.maxLength(50)]);
    } else {
      numeroSeguro.setValidators([Validators.maxLength(50)]);
      numeroSeguro.setValue('', { emitEvent: false });
    }

    numeroSeguro.updateValueAndValidity({ emitEvent: false });
  }

  activarEdicion() {
    this.editando = true;
    this.exitoMensaje = '';
    this.errorMensaje = '';
    this.form.enable();
    this.actualizarValidacionSeguro();
  }

  cancelarEdicion() {
    this.editando = false;
    this.mostrarConfirmacion = false;
    this.cerrarMapa();
    this.rellenarFormulario();
    this.form.disable();
  }

  pedirConfirmacion() {
    this.exitoMensaje = '';
    this.errorMensaje = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.mostrarConfirmacion = true;
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
  }

  confirmarGuardado() {
    if (!this.paciente || this.form.invalid) return;

    this.guardando = true;
    this.mostrarConfirmacion = false;

    const valor = this.form.getRawValue();

    const payload = {
      ...this.paciente,
      nombre: String(valor.nombre ?? '').trim(),
      apellido: String(valor.apellido ?? '').trim(),
      correo: String(valor.correo ?? '').trim(),
      telefono: String(valor.telefono ?? '').trim(),
      direccion: String(valor.direccion ?? '').trim(),
      genero: valor.genero as Genero,
      seguroMedico: valor.seguroMedico as SeguroMedico,
      numeroSeguro: valor.seguroMedico === 'NINGUNO' ? '' : String(valor.numeroSeguro ?? '').trim(),
    };

    this.http.put(`${this.urlBackend}/pacientes/perfil`, payload, {
      headers: this.obtenerHeaders()
    }).subscribe({
      next: (data: any) => {
        this.paciente = data;
        this.editando = false;
        this.guardando = false;
        this.form.disable();
        this.rellenarFormulario();
        this.exitoMensaje = 'Tu información fue actualizada correctamente.';
      },
      error: (error) => {
        console.error('Error al actualizar paciente:', error);
        this.errorMensaje = 'No se pudieron guardar los cambios. Intenta nuevamente.';
        this.guardando = false;
      }
    });
  }

  limpiarTelefono() {
    const control = this.form.get('telefono');
    const limpio = String(control?.value ?? '').replace(/\D/g, '').slice(0, 9);
    control?.setValue(limpio, { emitEvent: false });
  }

  campoInvalido(nombre: string): boolean {
    const control = this.form.get(nombre);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  verificarDato(dato: any): string {
    return dato ? dato : 'Pendiente de registro en clínica';
  }

  abrirMapa() {
    if (!this.editando) return;

    this.direccionMapa = this.form.get('direccion')?.value || '';
    this.mapaAbierto = true;

    setTimeout(() => {
      this.inicializarMapa();
    }, 150);
  }

  cerrarMapa() {
    this.mapaAbierto = false;

    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
      this.marcador = null;
    }
  }

  private inicializarMapa() {
    const contenedor = document.getElementById('miniMapaPaciente');
    if (!contenedor) return;

    if (this.mapa) {
      this.mapa.remove();
    }

    const latInicial = -12.0464;
    const lngInicial = -77.0428;

    this.mapa = L.map(contenedor, {
      zoomControl: true,
      attributionControl: false,
    }).setView([latInicial, lngInicial], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.mapa);

    this.marcador = L.marker([latInicial, lngInicial], {
      draggable: true,
      icon: this.crearIconoPin(),
    }).addTo(this.mapa);

    this.mapa.on('click', (event: L.LeafletMouseEvent) => {
      this.seleccionarUbicacion(event.latlng.lat, event.latlng.lng);
    });

    this.marcador.on('dragend', () => {
      const posicion = this.marcador?.getLatLng();

      if (posicion) {
        this.seleccionarUbicacion(posicion.lat, posicion.lng);
      }
    });

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 250);

    if (this.direccionMapa.trim()) {
      this.buscarDireccionEnMapa();
    }
  }

  private crearIconoPin(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #ef4444;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: #ffffff;
            border-radius: 50%;
            margin: 7px;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  }

  private seleccionarUbicacion(lat: number, lng: number) {
    if (!this.mapa || !this.marcador) return;

    this.marcador.setLatLng([lat, lng]);
    this.mapa.setView([lat, lng], 17);
    this.obtenerDireccionPorCoordenadas(lat, lng);
  }

  async buscarDireccionEnMapa() {
    const direccion = this.direccionMapa.trim();

    if (!direccion || !this.mapa || !this.marcador) return;

    this.buscandoDireccion = true;

    try {
      const query = encodeURIComponent(direccion);
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`);
      const data = await respuesta.json();

      if (data && data.length > 0) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);

        this.marcador.setLatLng([lat, lng]);
        this.mapa.setView([lat, lng], 17);
        this.direccionMapa = data[0].display_name || direccion;
      }
    } catch (error) {
      console.error('Error buscando dirección:', error);
    } finally {
      this.buscandoDireccion = false;
    }
  }

  private async obtenerDireccionPorCoordenadas(lat: number, lng: number) {
    this.buscandoDireccion = true;

    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await respuesta.json();

      this.direccionMapa = data?.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      this.direccionMapa = `${lat}, ${lng}`;
    } finally {
      this.buscandoDireccion = false;
    }
  }

  usarMiUbicacionActual() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((posicion) => {
      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;

      this.seleccionarUbicacion(lat, lng);
    });
  }

  actualizarDireccionMapa(event: Event) {
    this.direccionMapa = (event.target as HTMLInputElement).value;
  }

  aplicarDireccionMapa() {
    const direccion = this.direccionMapa.trim();

    if (direccion) {
      this.form.patchValue({ direccion });
      this.form.get('direccion')?.markAsDirty();
    }

    this.cerrarMapa();
  }
}