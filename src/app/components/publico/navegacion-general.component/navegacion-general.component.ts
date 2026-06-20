import { Component } from '@angular/core';
import { BtnLoguinComponent } from '../btn-loguin.component/btn-loguin.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navegacion-general',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BtnLoguinComponent],
  templateUrl: './navegacion-general.component.html',
  styleUrl: './navegacion-general.component.scss',
})
export class NavegacionGeneralComponent {

}