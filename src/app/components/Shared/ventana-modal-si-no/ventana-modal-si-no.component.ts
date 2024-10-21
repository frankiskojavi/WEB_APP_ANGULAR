import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-ventana-modal-si-no',
  standalone: true,
  templateUrl: './ventana-modal-si-no.component.html',
  styleUrls: ['./ventana-modal-si-no.component.css'],
  imports: [CommonModule]
})
export class VentanaModalSiNoComponent {
  @Input() title: string = 'Confirmación';  // Título del modal
  @Input() bodyText: string = '';  // Texto del cuerpo del modal
  @Input() confirmButtonText: string = 'Confirmar';  // Texto del botón confirmar
  @Input() cancelButtonText: string = 'Cancelar';  // Texto del botón cancelar

  @Output() onConfirm = new EventEmitter<void>();  // Evento cuando se confirma
  @Output() onCancel = new EventEmitter<void>();  // Evento cuando se cancela

  private modalInstance: any;

  // Método para abrir el modal
  open() {
    const modalElement = document.getElementById('confirmationModal');
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  // Método para cerrar el modal
  close() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  // Cuando se hace clic en confirmar
  confirm() {
    this.onConfirm.emit();
    this.close();
  }

  // Cuando se hace clic en cancelar
  cancel() {
    this.onCancel.emit();
    this.close();
  }
}
