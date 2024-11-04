import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';  
import { ArchivoME13Service } from '../../../services/archivo-me13.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingScreenComponent } from '../../Shared/loading-screen-component/loading-screen-component.component';
import { VentanaModalInformativaComponent } from '../../Shared/ventana-modal-informativa/ventana-modal-informativa.component';
import { VentanaModalSiNoComponent } from '../../Shared/ventana-modal-si-no/ventana-modal-si-no.component';
import { MenuAppService } from '../../../services/menu-app.service';
import { OpcionesMenu } from '../../Shared/modelosPublicos/menu.model';

@Component({
  selector: 'app-archivo-me13',
  standalone: true,
  templateUrl: './archivo-me13.component.html',
  styleUrls: ['./archivo-me13.component.css'],
  imports: [FormsModule, RouterModule, CommonModule, VentanaModalSiNoComponent, VentanaModalInformativaComponent, LoadingScreenComponent]
})
export class ArchivoME13Component implements OnInit {

  // Ventanas modal
  @ViewChild(VentanaModalSiNoComponent) modalSiNo!: VentanaModalSiNoComponent;
  @ViewChild(VentanaModalInformativaComponent) modalInformacion!: VentanaModalInformativaComponent;
  
  // Modelo Pagina 
  formModel: any = {
    codigoArchivo: 'ME',
    mes: null,
    ano: null,
    nombreArchivo: '',
    registrosProcesados: 0,
    registrosConError: 0, 
    tituloPagina: ''
  };

  // Variables del formulario   
  errorMessage: string | null = null;
  meses: { value: number, text: string }[] = [];
  anos: number[] = [];
  isLoading: boolean = false;  // Controlar la pantalla de carga

  constructor(private archivoME13Service: ArchivoME13Service, private menuService: MenuAppService) {}

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
  PostGenerarArchivo() {
    this.isLoading = true;
  
    const fechaInicial = Number(this.formModel.ano + this.formModel.mes.toString().padStart(2, '0') + '01');
    const fechaFinal = Number(this.formModel.ano + '' + this.formModel.mes.toString().padStart(2, '0') + '31');
  
    this.archivoME13Service.GenerarArchivoIVE13ME(fechaInicial, fechaFinal).subscribe({
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
    this.archivoME13Service.getMeses().subscribe(meses => {
      this.meses = meses;
    });
    this.archivoME13Service.getAnos().subscribe(anos => {
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
      this.modalSiNo.bodyText = `¿Está seguro de generar el archivo "${this.formModel.nombreArchivo}"?`;
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
