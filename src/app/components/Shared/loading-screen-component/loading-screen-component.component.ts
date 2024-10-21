import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-loading-screen-component',
  standalone: true,
  templateUrl: './loading-screen-component.component.html',
  styleUrls: ['./loading-screen-component.component.css'],
  encapsulation: ViewEncapsulation.None  // Desactiva el encapsulado de estilos
})
export class LoadingScreenComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Cargando...';
}
