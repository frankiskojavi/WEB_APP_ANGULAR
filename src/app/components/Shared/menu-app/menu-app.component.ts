import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuAppService } from '../../../services/menu-app.service';
import { OpcionesMenu } from '../modelosPublicos/menu.model';

@Component({
  standalone: true,  
  selector: 'app-menu-app',
  templateUrl: './menu-app.component.html',
  styleUrls: ['./menu-app.component.css'],
  imports: [CommonModule, RouterModule] 
})
export class MenuComponent implements OnInit {  
  menuOptions: OpcionesMenu[] = [];

  constructor(private menuService: MenuAppService) {}

  ngOnInit(): void {
    // Llamamos a la API para obtener los datos del menú
    this.menuService.getMenuOptions().subscribe({
      next: (data) => {        
        this.menuOptions = data;  // Asignamos los datos del menú
      },
      error: (err) => {
        console.error("Error al obtener el menú", err);  // Mostramos el error si falla
      }
    });    
  }

  guardarOpcionSeleccionada(menuOption: OpcionesMenu): void {
    this.menuService.registrarOpcionSeleccioanda(menuOption);
  }    

}
