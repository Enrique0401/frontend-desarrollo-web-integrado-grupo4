import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medico } from '../../../models/medicos.model';

@Component({
  selector: 'app-medicos-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicos-card.component.html',
  styleUrl: './medicos-card.component.scss'
})
export class MedicosCardComponent {
  
  medicos: Medico[] = [
    {
      id: 1,
      nombre: 'Carlos',
      apellido: 'Mendoza',
      numeroColegiatura: 'CMP-45892',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf9pflQX7S7hxY7ARIDhW-CQz7Wvx3_OkM-JCUnVxRmqNbOqtrLTD9mrs&s=10',
      especialidad: 'Cardiología',
      activo: true
    },
    {
      id: 2,
      nombre: 'Ana',
      apellido: 'Torres',
      numeroColegiatura: 'CMP-78213',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5K2GTYBLukR3inngdkk920wxtmvaPJnfr9vZe1c26PoztGVUMoA1XbQE&s=10',
      especialidad: 'Neurología',
      activo: false
    },
    {
      id: 3,
      nombre: 'Luis',
      apellido: 'Sánchez',
      numeroColegiatura: 'CMP-12948',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAvTJcW2-6ERtUoW6h9BFDm1N9CeqicJPKNQQH-nnzS2Tg4FgCzW2vGWfX&s=10',
      especialidad: 'Pediatría',
      activo: true
    },
    {
      id: 4,
      nombre: 'Anna',
      apellido: 'Palmer',
      numeroColegiatura: 'CMP-13008',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfZ1RWpPTJqvImV970ziic_tyLcL4aU01ZQk7Cw5QYKpgwYNwSgH49oRE&s=10',
      especialidad: 'Oftalmologia',
      activo: true
    },
    {
      id: 5,
      nombre: 'Erick',
      apellido: 'Rodriguez',
      numeroColegiatura: 'CMP-12154',
      imagen: 'https://www.futbolred.com/files/article_main/uploads/2024/09/12/66e31c800051a.jpeg',
      especialidad: 'Cardiologia',
      activo: true
    }
  ];

  toggleActivo(medico: Medico) {
    medico.activo = !medico.activo;
  }
}