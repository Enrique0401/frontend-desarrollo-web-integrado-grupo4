import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-panel-general',
  imports: [RouterLink],
  templateUrl: './panel-general.component.html',
  styleUrl: './panel-general.component.scss',
})
export class PanelGeneralComponent {
  estadisticas = [
    { valor: '20+', label: 'Especialidades' },
    { valor: '50+', label: 'Médicos expertos' },
    { valor: '15K+', label: 'Pacientes atendidos' },
    { valor: '24/7', label: 'Emergencias' },
  ];

  servicios = [
    {
      icono: 'pi pi-user-plus',
      titulo: 'Consultas médicas',
      descripcion: 'Atención personalizada con especialistas certificados en diagnóstico y tratamiento integral.',
    },
    {
      icono: 'pi pi-chart-line',
      titulo: 'Diagnóstico avanzado',
      descripcion: 'Laboratorio clínico, imagenología y estudios especializados con tecnología de última generación.',
    },
    {
      icono: 'pi pi-heart',
      titulo: 'Atención de emergencias',
      descripcion: 'Servicio de urgencias disponible las 24 horas con personal capacitado y equipamiento completo.',
    },
    {
      icono: 'pi pi-calendar',
      titulo: 'Agenda en línea',
      descripcion: 'Reserva tus citas de forma rápida y segura a través de nuestros canales digitales.',
    },
  ];

  beneficios = [
    'Equipo médico con amplia experiencia y formación continua',
    'Instalaciones modernas con equipos de diagnóstico de vanguardia',
    'Atención personalizada y trato humano en cada consulta',
    'Cobertura de más de 20 especialidades médicas',
    'Emergencias disponibles las 24 horas, todos los días',
  ];

  especialidadesDestacadas = [
    { icono: 'pi pi-heart', nombre: 'Cardiología', descripcion: 'Salud cardiovascular integral' },
    { icono: 'pi pi-users', nombre: 'Pediatría', descripcion: 'Cuidado especializado para niños' },
    { icono: 'pi pi-eye', nombre: 'Oftalmología', descripcion: 'Diagnóstico y tratamiento visual' },
    { icono: 'pi pi-shield', nombre: 'Traumatología', descripcion: 'Lesiones y sistema óseo' },
    { icono: 'pi pi-star', nombre: 'Ginecología', descripcion: 'Salud reproductiva femenina' },
    { icono: 'pi pi-sitemap', nombre: 'Neurología', descripcion: 'Sistema nervioso y cerebro' },
  ];

  testimonios = [
    {
      nombre: 'María González',
      especialidad: 'Paciente de Cardiología',
      texto: 'La atención fue excepcional. Los médicos me explicaron todo con paciencia y el trato fue muy humano. Me siento en confianza.',
    },
    {
      nombre: 'Carlos Ruiz',
      especialidad: 'Paciente de Traumatología',
      texto: 'Instalaciones impecables y un equipo muy profesional. Mi recuperación fue más rápida de lo esperado gracias a su seguimiento.',
    },
    {
      nombre: 'Ana Torres',
      especialidad: 'Paciente de Pediatría',
      texto: 'Llevo a mis hijos desde hace años. Siempre reciben un trato cálido y los pediatras son muy dedicados. Totalmente recomendado.',
    },
  ];
}
