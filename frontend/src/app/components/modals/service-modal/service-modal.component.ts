import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { serviceModel } from '../../../pages/dashboard/services/model/service.model';
import { OptimizeImg } from '../../../utils/Utils';

@Component({
    selector: 'app-service-modal',
    templateUrl: './service-modal.component.html'
})
export class ServiceModalComponent {
    serviceForm: FormGroup;
    formData: FormData;
    files: File[] = [];
    imagePreview: string;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ServiceModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { service: serviceModel }
    ) {
        // Inicializa el formulario con valores predeterminados o los datos del servicio
        this.serviceForm = this.fb.group({
            img: [this.data.service.img],
            name: [this.data.service.name, Validators.required],
            description: [this.data.service.description , Validators.required],
			category: [this.data.service.category, Validators.required],
			url: [this.data.service.url, Validators.pattern('https?://.+')] // Valida que sea una URL
        });
        this.formData = new FormData();

        // Inicializa la vista previa de la imagen
        this.imagePreview = this.data.service.img || '';
    }

    // Maneja el evento de archivos arrastrados y soltados
    async onFileDropped(event: any) {
        const file = event.addedFiles[0];
        if (file && file.type.startsWith('image/')) {
            this.files = [file];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };

            reader.readAsDataURL(file);
            const optimizedImage = await OptimizeImg(this.files[0]);
            this.formData.append('img', optimizedImage );
        }
    }

    // Elimina un archivo seleccionado
    onRemove(file: File): void {
        this.files = this.files.filter(f => f !== file);
        this.imagePreview = '';
    }

    // Cancela el diálogo
    onCancel(): void {
        this.dialogRef.close();
    }

    async onSubmit() {
        const action = this.data.service.id ? 'edit' : 'add';
        if(action == "edit" && this.data.service.id){ this.formData.append('id', (this.data.service.id).toString())}
        this.formData.append('name', this.serviceForm.value.name);
        this.formData.append('description', this.serviceForm.value.description);
		this.formData.append('category', this.serviceForm.value.category);
		this.formData.append('url', this.serviceForm.value.url);

        this.dialogRef.close({
            action,
            data: this.formData
        });
    }


    // Maneja la eliminación de un servicio
    onDelete(service: serviceModel | undefined) {
        if (!service) {
            console.error('Servicio no encontrado');
            return;
        }

        this.dialogRef.close({ action: 'delete', data: service });
    }
}
