import { Component } from '@angular/core'; 
import { NavegacionGeneralComponent } from '../navegacion-general.component/navegacion-general.component';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-panel-general',
  imports: [NavegacionGeneralComponent, Button], 
  templateUrl: './panel-general.component.html',
  styleUrl: './panel-general.component.scss',
})
export class PanelGeneralComponent {
}