import { Component, OnInit } from '@angular/core';
import { OpcionesMenu } from '../../Shared/modelosPublicos/menu.model';
import { MenuAppService } from '../../../services/menu-app.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent implements OnInit{
  menuOptions: OpcionesMenu[] = [];
  constructor(private menuService: MenuAppService, private router: Router) {}

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
    this.router.navigate([menuOption.menuPagina]); 
  }    
  
}
