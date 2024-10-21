import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingScreenComponent } from '../../Shared/loading-screen-component/loading-screen-component.component';
import { VentanaModalInformativaComponent } from '../../Shared/ventana-modal-informativa/ventana-modal-informativa.component';
import { VentanaModalSiNoComponent } from '../../Shared/ventana-modal-si-no/ventana-modal-si-no.component';
import { ArchivoME14Service } from '../../../services/archivo-me14.service';

@Component({
  selector: 'app-archivo-me14',
  standalone: true,  
  templateUrl: './archivo-ef14.component.html',
  styleUrl: './archivo-ef14.component.css',
  imports: [FormsModule, RouterModule, CommonModule, VentanaModalSiNoComponent, VentanaModalInformativaComponent, LoadingScreenComponent]
})
export class ArchivoME14Component implements OnInit{  

  // Ventanas modal
  @ViewChild(VentanaModalSiNoComponent) modalSiNo!: VentanaModalSiNoComponent;
  @ViewChild(VentanaModalInformativaComponent) modalInformacion!: VentanaModalInformativaComponent;
  
  
  // Modelo Pagina 
  formModel: any = {
    codigoArchivo: 'EF',
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

  constructor(private archivoME14Service: ArchivoME14Service) {}

  // Form Load
  ngOnInit(): void {
    this.cargarInformacionDefault();    
  }

  // Form Post
  PostGenerarArchivo() {
    this.isLoading = true;  // Mostrar la pantalla de carga
  
    var fechaInicial = Number(this.formModel.ano + this.formModel.mes.toString().padStart(2, '0') + '01');
    var fechaFinal = Number(this.formModel.ano + '' + this.formModel.mes.toString().padStart(2, '0') + '31');
  
    this.archivoME14Service.generarArchivo(this.formModel, this.formModel.nombreArchivo, fechaInicial, fechaFinal).subscribe({
      next: (response) => {
        const link = document.createElement('a');
        link.href = 'data:text/plain;base64,' + response.fileContent;
        link.download = response.fileName;
        link.click();
  
        // Mostrar la cantidad de registros procesados
        this.formModel.registrosProcesados = response.registrosProcesados;
  
        this.mostrarMensajeFinalizado();
        this.isLoading = false;  // Ocultar la pantalla de carga        
      },
      error: (error) => {
        this.errorMessage = 'Hubo un error al generar el archivo.';
        console.error('Error al generar archivo:', error);
        this.isLoading = false;  // Ocultar la pantalla de carga si hay error
      }
    });
  }

  cancelar() {
    window.location.href = '/';
  }

  cargarInformacionDefault() {
    this.archivoME14Service.getMeses().subscribe(meses => {
      this.meses = meses;
    });
    this.archivoME14Service.getAnos().subscribe(anos => {
      this.anos = anos;
    });
    const currentDate = new Date();
    this.formModel.mes = currentDate.getMonth() + 1;
    this.formModel.ano = currentDate.getFullYear();
    this.actualizarNombreArchivo();
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
