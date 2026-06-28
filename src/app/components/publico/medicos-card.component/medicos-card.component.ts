import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Especialidad } from '../../../models/especialidades.model';

@Component({
  selector: 'app-medicos-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicos-card.component.html',
  styleUrl: './medicos-card.component.scss'
})
export class MedicosCardComponent {

  especialidades: Especialidad[] = [
    {
      id: 1,
      nombre: 'Cardiología',
      descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/070/680/779/small_2x/doctor-examining-holographic-heart-advanced-medical-technology-for-cardiology-diagnosis-and-treatment-planning-photo.jpeg'
    },
    {
      id: 2,
      nombre: 'Dermatología',
      descripcion: 'Tratamiento de enfermedades de la piel, cabello y uñas.',
      imagen: 'https://clinicadelapiel.com.co/wp-content/uploads/dermatologia-clinica-1536x864.jpg'
    },
    {
      id: 3,
      nombre: 'Endocrinología',
      descripcion: 'Diagnóstico y tratamiento de enfermedades hormonales y metabólicas.',
      imagen: 'https://www.gruporecoletas.com/imagenes/institutos/132_endocrinologia-que-es.png'
    },
    {
      id: 4,
      nombre: 'Gastroenterología',
      descripcion: 'Tratamiento de enfermedades del aparato digestivo.',
      imagen: 'https://clinicavitasalud.com/wp-content/uploads/2024/12/gastroenterologia.webp'
    },
    {
      id: 5,
      nombre: 'Ginecología',
      descripcion: 'Especialidad enfocada en la salud del sistema reproductor femenino.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/018/919/240/small_2x/doctor-holding-uterus-and-ovaries-model-ovarian-and-cervical-cancer-cervix-disorder-endometriosis-hysterectomy-uterine-fibroids-reproductive-system-and-pregnancy-concept-photo.jpg'
    },
    {
      id: 6,
      nombre: 'Medicina General',
      descripcion: 'Atención médica integral para diagnóstico y tratamiento de enfermedades comunes.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/054/424/332/small_2x/doctor-working-in-the-office-and-listening-to-the-patient-she-is-explaining-her-symptoms-healtcare-and-assistance-concept-free-photo.JPG'
    },
    {
      id: 7,
      nombre: 'Nefrología',
      descripcion: 'Especialidad dedicada a las enfermedades de los riñones.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/046/673/222/small_2x/portrait-of-young-female-doctor-cardiologist-working-in-office-of-modern-clinic-free-photo.jpg'
    },
    {
      id: 8,
      nombre: 'Neumología',
      descripcion: 'Tratamiento de enfermedades del aparato respiratorio.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/080/929/287/small_2x/specialists-discusses-lung-patient-health-while-showcasing-a-detailed-x-ray-image-in-medical-clinic-setting-pulmonology-department-photo.jpg'
    },
    {
      id: 9,
      nombre: 'Neurología',
      descripcion: 'Diagnóstico y tratamiento de enfermedades del sistema nervioso.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/010/601/195/small_2x/doctor-pointing-at-mri-of-human-brain-photo.jpg'
    },
    {
      id: 10,
      nombre: 'Obstetricia',
      descripcion: 'Atención del embarazo, parto y puerperio.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/047/017/134/small_2x/close-up-midwife-s-hands-showing-baby-embryo-hologram-genetic-engineering-surrogacy-embryology-genetic-analysis-in-pregnancy-planning-artificial-insemination-technology-the-future-of-medicine-free-photo.jpeg'
    },
    {
      id: 11,
      nombre: 'Odontología',
      descripcion: 'Prevención y tratamiento de enfermedades bucodentales.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/072/451/668/small_2x/dental-care-concept-with-a-large-tooth-model-and-professional-dental-tools-including-a-mirror-and-scaler-displayed-on-a-reflective-surface-in-a-clinical-setting-photo.jpg'
    },
    {
      id: 12,
      nombre: 'Oftalmología',
      descripcion: 'Atención médica de enfermedades de los ojos y la visión.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/063/232/465/small_2x/a-woman-looking-through-an-eye-exam-machine-free-photo.jpeg'
    },
    {
      id: 13,
      nombre: 'Oncología',
      descripcion: 'Prevención, diagnóstico y tratamiento del cáncer.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/006/931/211/small_2x/cancer-patient-woman-wearing-head-scarf-and-her-supportive-daughter-in-hospital-health-and-insurance-concept-free-photo.jpg'
    },
    {
      id: 14,
      nombre: 'Ortopedia',
      descripcion: 'Especialidad dedicada a la corrección de deformidades y enfermedades óseas.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/006/899/674/small_2x/a-doctor-pointing-at-lumbar-vertebra-model-in-medical-office-photo.jpg'
    },
    {
      id: 15,
      nombre: 'Otorrinolaringología',
      descripcion: 'Tratamiento de enfermedades del oído, nariz y garganta.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/033/051/321/small_2x/hearing-exam-otolaryngologist-doctor-checking-woman-s-ear-using-otoscope-or-auriscope-at-medical-clinic-otorhinolaryngologist-pulling-ear-with-hand-and-looking-at-it-with-otoscope-closeup-photo.jpg'
    },
    {
      id: 16,
      nombre: 'Pediatría',
      descripcion: 'Atención médica especializada en niños y adolescentes.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/036/196/238/small_2x/ai-generated-cute-baby-boy-playing-doctor-with-stethoscope-and-toy-bear-baby-and-stethoscope-of-pediatrician-for-healthcare-consulting-ai-generated-free-photo.jpg'
    },
    {
      id: 17,
      nombre: 'Psiquiatría',
      descripcion: 'Prevención, diagnóstico y tratamiento de trastornos mentales.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/018/790/394/small_2x/psychiatrist-or-professional-psychologist-consulting-on-diagnostic-examination-disease-or-mental-illness-in-medical-clinic-or-hospital-mental-medical-and-healthy-service-concept-free-photo.jpg'
    },
    {
      id: 18,
      nombre: 'Reumatología',
      descripcion: 'Diagnóstico y tratamiento de enfermedades de las articulaciones y tejido conectivo.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/076/677/774/small_2x/doctor-examining-patients-inflamed-hand-with-blue-gloves-free-photo.jpeg'
    },
    {
      id: 19,
      nombre: 'Traumatología',
      descripcion: 'Diagnóstico y tratamiento de lesiones del sistema musculoesquelético.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/073/101/756/small_2x/a-woman-in-a-hospital-bed-with-her-leg-up-free-photo.jpg'
    },
    {
      id: 20,
      nombre: 'Urología',
      descripcion: 'Diagnóstico y tratamiento de enfermedades del sistema urinario y reproductor masculino.',
      imagen: 'https://static.vecteezy.com/system/resources/thumbnails/042/646/242/small_2x/doctor-uses-anatomical-model-to-explain-male-urinary-system-model-labeled-with-parts-doctor-points-and-explains-how-they-work-together-for-urinary-function-ensuring-patient-comprehension-free-photo.jpg'
    }
  ];
}