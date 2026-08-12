/**
 * Componente que renderiza un modal para confirmar una acción.
 *
 * Recibe por parámetro un objeto que contiene la información a mostrar
 * en el modal. El objeto debe tener las propiedades:
 *
 * - title: El título del modal.
 * - message: El mensaje a mostrar en el modal.
 * - isConfirm: Un booleano que indica si el modal es de confirmación.
 *
 * Si el valor de isConfirm es true, el modal mostrará un botón para confirmar
 * y otro para cancelar. En caso de que sea false, solo se mostrará un botón
 * para aceptar.
 */
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent {
    /**
     * Constructor del componente.
     *
     * @param dialogRef Referencia al diálogo.
     * @param data Información a mostrar en el modal.
     */
    constructor(
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string;
            message: string;
            isConfirm: boolean;
        }
    ) { }
}