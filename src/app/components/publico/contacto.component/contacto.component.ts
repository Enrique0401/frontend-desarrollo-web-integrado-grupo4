import { Component } from '@angular/core';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss',
})
export class ContactoComponent {
  canales = [
    {
      icono: 'pi pi-phone',
      titulo: 'Llamada telefónica',
      descripcion: 'Comunícate con nuestra central telefónica para consultas generales y agendar citas.',
    },
    {
      icono: 'pi pi-whatsapp',
      titulo: 'WhatsApp',
      descripcion: 'Escríbenos para recibir atención rápida, confirmar citas o resolver dudas.',
    },
    {
      icono: 'pi pi-envelope',
      titulo: 'Correo electrónico',
      descripcion: 'Envíanos un correo y te responderemos en un plazo máximo de 24 horas hábiles.',
    },
    {
      icono: 'pi pi-map-marker',
      titulo: 'Visita presencial',
      descripcion: 'Acude directamente a nuestras instalaciones. Contamos con estacionamiento para pacientes.',
    },
  ];

  preguntas = [
    {
      pregunta: '¿Cómo puedo agendar una cita médica?',
      respuesta: 'Puedes agendar tu cita llamando a nuestra central telefónica, escribiéndonos por WhatsApp o registrándote en nuestra plataforma en línea.',
    },
    {
      pregunta: '¿Atienden emergencias fuera del horario regular?',
      respuesta: 'Sí, nuestro servicio de emergencias está disponible las 24 horas del día, los 7 días de la semana, con personal médico capacitado.',
    },
    {
      pregunta: '¿Qué especialidades médicas ofrecen?',
      respuesta: 'Contamos con más de 20 especialidades médicas incluyendo cardiología, pediatría, traumatología, ginecología, neurología y más.',
    },
    {
      pregunta: '¿Dónde están ubicados?',
      respuesta: 'Nos encontramos en Av. Larco 1234, Trujillo, La Libertad, Perú. Puedes ver nuestra ubicación exacta en el mapa de esta página.',
    },
  ];
}
