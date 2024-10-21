import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-ventana-modal-informativa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventana-modal-informativa.component.html',
  styleUrl: './ventana-modal-informativa.component.css'
})
export class VentanaModalInformativaComponent {
  @Input() title: string = 'Confirmación';  // Título del modal
  @Input() bodyText: string = '';  // Texto del cuerpo del modal

  @Output() onConfirm = new EventEmitter<void>();  // Evento cuando se confirma
  @Output() onCancel = new EventEmitter<void>();  // Evento cuando se cancela
  private modalInstance: any;

  // Método para abrir el modal
  open() {
    const modalElement = document.getElementById('informationModal');
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
