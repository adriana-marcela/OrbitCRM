/**
 * Componente de perfil del usuario
 *
 * Muestra la información del usuario logueado y permite editarla,
 * cambiar la contraseña y subir una imagen de perfil.
 */
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Countries, OptimizeImg } from '../../../utils/Utils';
import { SharedModule } from '../../../shared/shared.module';
import { userModel } from './model/profile.model';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        SharedModule
    ],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    userForm!: FormGroup;
    passForm!: FormGroup;
    files: File[] = [];
    formData: FormData;
    imagePreview: string = '';
    countries: string[] = Countries();
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;
    userData: userModel = {
        photo: '',
        name: '',
        lastname: '',
        position: '',
        documentType: '',
        documentNumber: 0,
        email: '',
        country: '',
        department: '',
        city: '',
        address: '',
        phone: '',
        currentPassword: '',
        newPassword: ''
    };
    user: any;

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private apiService: ApiService
    ) {
        this.formData = new FormData();
    }

    /**
     * Inicializa los formularios con los valores
     * de los campos de la interfaz de usuario
     */
    ngOnInit(): void {
        const us = localStorage.getItem('user') || "";
        this.user = JSON.parse(us);
        this.initializeForm();
        this.loadUserData();
    }

    /**
     * Inicializa los formularios con los valores
     * de los campos de la interfaz de usuario
     */
    initializeForm(): void {
        this.userForm = this.fb.group({
            name: [this.userData.name],
            lastname: [this.userData.lastname],
            position: [this.userData.position],
            documentType: [this.userData.documentType],
            documentNumber: [this.userData.documentNumber],
            email: [this.userData.email, [Validators.email]],
            country: [this.userData.country],
            department: [this.userData.department],
            city: [this.userData.city],
            address: [this.userData.address],
            phone: [this.userData.phone]
        });

        this.passForm = this.fb.group({
            currentPassword: [''],
            newPassword: ['', [Validators.minLength(8)]],
            confirmPassword: ['', [Validators.minLength(8)]]
        });

        this.imagePreview = this.userData.photo || '';
    }

    /**
     * Carga la información del usuario
     */
    async loadUserData() {
        try {
            const data = await firstValueFrom(this.apiService.getData(`users/${this.user.email}`));
            this.userData = { ...data };
            this.initializeForm();
        } catch (error) {
            console.error('Fail:', error);
        }
    }

    /**
     * Muestra u oculta el campo de contraseña
     * @param field string
     */
    togglePasswordVisibility(field: string): void {
        if (field === 'currentPassword') {
            this.showCurrentPassword = !this.showCurrentPassword;
        } else if (field === 'newPassword') {
            this.showNewPassword = !this.showNewPassword;
        } else if (field === 'confirmPassword') {
            this.showConfirmPassword = !this.showConfirmPassword;
        }
    }

    /**
     * Verifica si las contraseñas coinciden
     * @returns boolean
     */
    passwordsMatch(): boolean {
        return this.passForm.get('newPassword')?.value === this.passForm.get('confirmPassword')?.value;
    }

    /**
     * Cambia la contraseña del usuario
     */
    async changePassword() {
        const formValues = { ...this.passForm.value };
        const { confirmPassword, ...UpdatedPass } = formValues;
        if (!this.passwordsMatch()) {
            this.snackBar.open('Las contraseñas no coinciden.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['snackbar-error']
            });
            return;
        }
        try {
            const data = await firstValueFrom(this.apiService.postData('users/change-password', UpdatedPass));
            this.snackBar.open('Información actualizada exitosamente.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
            });
        } catch (error) {
            console.error('Fail:', error);
        }
    }

    /**
     * Actualiza la información del usuario
     */
    async updatedInfo() {
        this.formData.append('name', this.userForm.value.name);
		this.formData.append(
			'lastname',
			this.userForm.value.lastname
		);
        this.formData.append(
			'position',
			this.userForm.value.position
		);
		this.formData.append(
			'documentType',
			this.userForm.value.documentType
		);
		this.formData.append(
			'documentNumber',
			this.userForm.value.documentNumber
		);
		this.formData.append('email', this.userForm.value.email);
		this.formData.append(
			'country',
			this.userForm.value.country
		);
		this.formData.append(
			'department',
			this.userForm.value.department
		);
		this.formData.append('city', this.userForm.value.city);
		this.formData.append(
			'address',
			this.userForm.value.address
		);
		this.formData.append('phone', this.userForm.value.phone);

        if (!this.userForm.dirty) {
            this.snackBar.open('No se hicieron cambios.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['snackbar-info']
            });
            return;
        }
        try {
            const data = await firstValueFrom(this.apiService.putData(`users/${this.userForm.value.email}`, this.formData));
            this.userData = { ...data };
            this.snackBar.open('Información actualizada exitosamente.', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['snackbar-success']
            });
        } catch (error) {
            console.error('Fail:', error);
        }
    }

    /**
     * Agrega o elimina una imagen de perfil
     * @param event any
     */
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
            this.formData.append('photo', optimizedImage);
            this.userForm.markAsDirty();
        }
    }

    /**
     * Elimina una imagen de perfil
     * @param file File
     */
    onFileRemove(file: File): void {
        this.files = this.files.filter(f => f !== file);
        this.imagePreview = '';
    }

	onInput(event: Event, length: number, control: any = '', fieldType: string = ''): void {
		const input = event.target as HTMLInputElement;

		if (fieldType === 'phone') {
			if (!input.value.startsWith('+')) {
				input.value = '+' + input.value.replace(/[^+\d]/g, '');
			} else {
				input.value = '+' + input.value.slice(1).replace(/[^0-9]/g, '');
			}
		} else {
			input.value = input.value.replace(/[^0-9]/g, '');
		}

		if (control != '') {
			control.setValue(input.value);
		}

		if (input.value.length > length) {
			input.value = input.value.slice(0, length);
			if (control != '') {
				control.setValue(input.value);
			}
		}
	}

    validateText(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const validPattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;

        if (!validPattern.test(inputElement.value)) {
            inputElement.value = inputElement.value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '');
        }
    }
}