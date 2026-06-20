import { Component } from '@angular/core';
import { NavegacionGeneralComponent } from '../navegacion-general.component/navegacion-general.component';
import { CommonModule } from '@angular/common';
import { FlechaComponent } from '../flecha/flecha';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [NavegacionGeneralComponent, CommonModule, FlechaComponent],
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
}