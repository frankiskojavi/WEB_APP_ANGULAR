import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingScreenComponent } from '../../Shared/loading-screen-component/loading-screen-component.component';
import { VentanaModalInformativaComponent } from '../../Shared/ventana-modal-informativa/ventana-modal-informativa.component';
import { VentanaModalSiNoComponent } from '../../Shared/ventana-modal-si-no/ventana-modal-si-no.component';
import { ArchivoDV17Service } from '../../../services/archivo-dv17.service';
import { MenuAppService } from '../../../services/menu-app.service';
import { OpcionesMenu } from '../../Shared/modelosPublicos/menu.model';
import { ArchivoChcajaService } from '../../../services/archivo-chcaja.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-archivo-chcaja',
  standalone: true,
  imports: [ FormsModule, RouterModule, CommonModule, VentanaModalSiNoComponent, VentanaModalInformativaComponent, LoadingScreenComponent ],
  templateUrl: './archivo-chcaja.component.html',
  styleUrl: './archivo-chcaja.component.css'
})
export class ArchivoChcajaComponent implements OnInit{

  // Ventanas modal
  @ViewChild(VentanaModalSiNoComponent) modalSiNo!: VentanaModalSiNoComponent;
  @ViewChild(VentanaModalInformativaComponent) modalInformacion!: VentanaModalInformativaComponent;
  private confirmSubscription: Subscription | null = null;

// Modelo Pagina 
  formModel: any = {
    codigoArchivo: 'CG',
    mes: null,
    ano: null,
    nombreArchivo: '',
    nombreArchivoPreliminar: '',
    registrosOKEncabezado: 0,
    registrosERROREncabezado: 0,
    registrosOKDetalle:0, 
    registrosERRORDetalle: 0,
    cantidadNit: 0
  };  

  // Variables del formulario   
  errorMessage: string | null = null;
  meses: { value: number, text: string }[] = [];
  anos: number[] = [];
  isLoading: boolean = false;  // Controlar la pantalla de carga

  constructor(private archivoCHCaja: ArchivoChcajaService, private menuService: MenuAppService) {}

  ngOnInit(): void {
    this.cargarInformacionDefault();   
    this.cargarInformacionMenu();
    const storedTitulo = localStorage.getItem('tituloPagina');
    if (storedTitulo) {
      this.formModel.tituloPagina = storedTitulo;
    }
  }
  
  // Form Post
  GenerarArchivo() {
    this.isLoading = true;
  
    const fechaInicial = Number(this.formModel.ano + this.formModel.mes.toString().padStart(2, '0') + '01');
    const fechaFinal = Number(this.formModel.ano + '' + this.formModel.mes.toString().padStart(2, '0') + '31');
  
    this.archivoCHCaja.GeneracionArchivoCHCaja(fechaInicial, fechaFinal).subscribe({
      next: (response) => {
        // Descargar el archivo usando el nombre predefinido
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(response.archivoBlob);
        link.href = url;
        link.download = this.formModel.nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);

        // Actualizar las cantidades de registros en el modelo
        this.formModel.registrosOKEncabezado = response.registrosOKEncabezado;
        this.formModel.registrosERROREncabezado = response.registrosERROREncabezado;
        this.formModel.registrosOKDetalle = response.registrosOKDetalle;
        this.formModel.registrosERRORDetalle = response.registrosERRORDetalle;
        this.formModel.cantidadNit = response.cantidadNit

        this.isLoading = false;        
      },
      error: (error) => {
        this.errorMessage = 'Hubo un error al generar el archivo.';
        console.error('Error al generar archivo:', error);
        this.isLoading = false;
      }
    });
  }

  GenerarArchivoPreliminar() {
    this.isLoading = true;  
    const fechaInicial = Number(this.formModel.ano + this.formModel.mes.toString().padStart(2, '0') + '01');
    const fechaFinal = Number(this.formModel.ano + '' + this.formModel.mes.toString().padStart(2, '0') + '31');
  
    this.archivoCHCaja.GeneracionArchivoCHCajaPreliminar(fechaInicial, fechaFinal).subscribe({
      next: (response) => {
        // Descargar el archivo usando el nombre predefinido
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(response.archivoBlob);
        link.href = url;
        link.download = this.formModel.nombreArchivoPreliminar;
        link.click();
        window.URL.revokeObjectURL(url);

        // Actualizar las cantidades de registros en el modelo
        this.formModel.registrosOKEncabezado = response.registrosOKEncabezado;
        this.formModel.registrosERROREncabezado = response.registrosERROREncabezado;
        this.formModel.registrosOKDetalle = response.registrosOKDetalle;
        this.formModel.registrosERRORDetalle = response.registrosERRORDetalle;
        this.formModel.cantidadNit = response.cantidadNit

        this.isLoading = false;        
      },
      error: (error) => {
        this.errorMessage = 'Hubo un error al generar el archivo.';
        console.error('Error al generar archivo:', error);
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    window.location.href = 'inicio';
  }

  cargarInformacionDefault() {
    this.archivoCHCaja.getMeses().subscribe(meses => {
      this.meses = meses;
    });
    this.archivoCHCaja.getAnos().subscribe(anos => {
      this.anos = anos;
    });
    const currentDate = new Date();
    this.formModel.mes = currentDate.getMonth() + 1;
    this.formModel.ano = currentDate.getFullYear();
    this.actualizarNombreArchivo();
  }

  cargarInformacionMenu(){ 
    // Suscríbete a la opción de menú seleccionada
    this.menuService.selectedMenuOption$.subscribe({
      next: (menuOption: OpcionesMenu | null) => {        
        if (menuOption) {
          console.log("si llegue");
          this.formModel.tituloPagina = menuOption.menuTitulo;
          localStorage.setItem('tituloPagina', menuOption.menuTitulo);
        }
      }
    });
  }

  actualizarNombreArchivo() {
    const mes = this.formModel.mes;
    const ano = this.formModel.ano;
    const codigoArchivo = this.formModel.codigoArchivo;
    if (mes && ano) {
      this.formModel.nombreArchivo = `${codigoArchivo}${ano.toString().slice(-2)}${mes.toString().padStart(2, '0')}BA.117`;
      this.formModel.nombreArchivoPreliminar = `PreIVECHCAJA${ano.toString().slice(-2)}${mes.toString().padStart(2, '0')}BA.117`;
    }
  }

  mostrarMensajeConfirmacion(definitivo: boolean) { 
    if (this.modalSiNo) {
      //Limpia suscripción      
      if (this.confirmSubscription) {
        this.confirmSubscription.unsubscribe();
      }
      this.modalSiNo.bodyText = `¿Está seguro de generar el archivo "${this.formModel.nombreArchivo}"?`;      
      this.confirmSubscription = this.modalSiNo.onConfirm.subscribe(() => {
        if (definitivo) {
          this.GenerarArchivo();
        } else {
          this.GenerarArchivoPreliminar();
        }
        this.confirmSubscription?.unsubscribe();
      });
      this.modalSiNo.open();
    }
  }


  mostrarMensajeFinalizado() {
    if (this.modalInformacion) {
      this.modalInformacion.bodyText = 'Archivo generado con Exito';
      this.modalInformacion.open();
    }
  }
}

