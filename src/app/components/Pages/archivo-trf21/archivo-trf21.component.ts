import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuAppService } from '../../../services/menu-app.service';
import { LoadingScreenComponent } from '../../Shared/loading-screen-component/loading-screen-component.component';
import { OpcionesMenu } from '../../Shared/modelosPublicos/menu.model';
import { VentanaModalInformativaComponent } from '../../Shared/ventana-modal-informativa/ventana-modal-informativa.component';
import { VentanaModalSiNoComponent } from '../../Shared/ventana-modal-si-no/ventana-modal-si-no.component';
import { ArchivoTrf21Service } from '../../../services/archivo-trf21.service';

@Component({
  selector: 'app-archivo-trf21',
  standalone: true,  
  templateUrl: './archivo-trf21.component.html',
  styleUrl: './archivo-trf21.component.css',
  imports: [FormsModule, RouterModule, CommonModule, VentanaModalSiNoComponent, VentanaModalInformativaComponent, LoadingScreenComponent]
})
export class ArchivoTrf21Component {
// Ventanas modal
  @ViewChild(VentanaModalSiNoComponent) modalSiNo!: VentanaModalSiNoComponent;
  @ViewChild(VentanaModalInformativaComponent) modalInformacion!: VentanaModalInformativaComponent;
  private confirmSubscription: Subscription | null = null;
  
  // Modelo Pagina 
  formModel: any = {
    codigoArchivo: 'TRF',
    mes: null,
    ano: null,
    nombreArchivo: '',
    registrosProcesados: 0,
    registrosConError: 0
  };  

  // Variables del formulario   
  errorMessage: string | null = null;
  meses: { value: number, text: string }[] = [];
  anos: number[] = [];
  isLoading: boolean = false;  // Controlar la pantalla de carga

  constructor(private archivoTrf21Service: ArchivoTrf21Service, private menuService: MenuAppService) {}

  // Form Load
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
  
    this.archivoTrf21Service.GenerarArchivoIVE21TRF(fechaInicial, fechaFinal).subscribe({
      next: (response) => {
        // Descargar el archivo usando el nombre predefinido
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(response.archivoBlob);
        link.href = url;
        link.download = this.formModel.nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);

        // Actualizar las cantidades de registros en el modelo
        this.formModel.registrosProcesados = response.cantidadRegistrosOK;
        this.formModel.registrosConError = response.cantidadRegistrosError;

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
    this.archivoTrf21Service.getMeses().subscribe(meses => {
      this.meses = meses;
    });
    this.archivoTrf21Service.getAnos().subscribe(anos => {
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
    }
  }
  
  mostrarMensajeConfirmacion() { 
    if (this.modalSiNo) {
      //Limpia suscripción      
      if (this.confirmSubscription) {
        this.confirmSubscription.unsubscribe();
      }
      this.modalSiNo.bodyText = `¿Está seguro de generar el archivo "${this.formModel.nombreArchivo}"?`;      
      this.confirmSubscription = this.modalSiNo.onConfirm.subscribe(() => {
        this.GenerarArchivo();        
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
