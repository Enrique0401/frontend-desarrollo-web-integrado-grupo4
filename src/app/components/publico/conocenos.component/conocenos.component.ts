import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conocenos.component.html',
  styleUrl: './conocenos.component.scss',
})
export class ConocenosComponent {
  valores = [
    { 
      icono: 'pi pi-heart-fill', 
      titulo: 'Empatía', 
      descripcion: 'Tratamos a cada paciente con el corazón, entendiendo sus necesidades y brindando apoyo humano.' 
    },
    { 
      icono: 'pi pi-star-fill', 
      titulo: 'Excelencia', 
      descripcion: 'Buscamos los más altos estándares de calidad en cada procedimiento médico y de atención.' 
    },
    { 
      icono: 'pi pi-shield', 
      titulo: 'Ética', 
      descripcion: 'Actuamos con total transparencia, honestidad y respeto por la vida en todo momento.' 
    },
    { 
      icono: 'pi pi-users', 
      titulo: 'Trabajo en Equipo', 
      descripcion: 'Colaboramos entre especialistas para ofrecer diagnósticos precisos y tratamientos efectivos.' 
    }
  ];

  infraestructura = [
    'https://cdn.pixabay.com/photo/2017/06/15/05/04/skin-2404163_1280.jpg',
    'https://cdn.pixabay.com/photo/2014/12/10/20/48/laboratory-563423_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/04/19/13/22/hospital-1338585_1280.jpg',
    'https://cdn.pixabay.com/photo/2020/03/05/16/58/hospital-4904920_1280.jpg'
  ];

  estadisticas = [
    { valor: '15+', label: 'Años de experiencia' },
    { valor: '50+', label: 'Profesionales de salud' },
    { valor: '20+', label: 'Especialidades médicas' },
    { valor: '15K+', label: 'Pacientes atendidos' },
  ];

  equipo = [
    {
      icono: 'pi pi-user',
      nombre: 'Dr. Carlos Mendoza',
      cargo: 'Director Médico',
      descripcion: 'Más de 20 años de experiencia en gestión hospitalaria y medicina interna.',
    },
    {
      icono: 'pi pi-user',
      nombre: 'Dra. Laura Vásquez',
      cargo: 'Jefa de Enfermería',
      descripcion: 'Especialista en cuidados intensivos con enfoque en la calidad asistencial.',
    },
    {
      icono: 'pi pi-user',
      nombre: 'Dr. Roberto Sánchez',
      cargo: 'Jefe de Cardiología',
      descripcion: 'Cardiólogo intervencionista con formación internacional y amplia trayectoria.',
    },
    {
      icono: 'pi pi-user',
      nombre: 'Dra. Patricia Luna',
      cargo: 'Jefa de Pediatría',
      descripcion: 'Dedicada al cuidado integral de niños y adolescentes con trato humanizado.',
    },
  ];

  hitos = [
    { anio: '2010', titulo: 'Fundación', descripcion: 'Nova Salud inicia operaciones como clínica de especialidades en Trujillo.' },
    { anio: '2014', titulo: 'Expansión', descripcion: 'Incorporamos nuevas especialidades y ampliamos nuestras instalaciones.' },
    { anio: '2018', titulo: 'Tecnología', descripcion: 'Modernizamos equipos de diagnóstico con tecnología de imagenología avanzada.' },
    { anio: '2022', titulo: 'Centro integral', descripcion: 'Consolidamos más de 20 especialidades y servicio de emergencias 24/7.' },
    { anio: '2025', titulo: 'Innovación digital', descripcion: 'Implementamos sistema de gestión digital para mejorar la experiencia del paciente.' },
  ];
}