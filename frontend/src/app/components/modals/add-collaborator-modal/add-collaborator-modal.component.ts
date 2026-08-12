import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { rolModel } from '../../../pages/dashboard/roles/model/roles.model';
import { collaboratorModel } from '../../../pages/dashboard/collaborators/model/collaborator.model';
import { bancos, Countries, OptimizeImg, formatDate } from '../../../utils/Utils'

/**
 * Componente que renderiza un modal para agregar un nuevo colaborador.
 */
@Component({
	selector: 'app-add-collaborator-modal',
	templateUrl: './add-collaborator-modal.component.html',
})
export class AddCollaboratorModalComponent {
	/**
	 * Formulario para la información general del colaborador.
	 */
	collaboratorForm: FormGroup;
	collabFormData: FormData;
	/**
	 * Formulario para la información bancaria del colaborador.
	 */
	bankForm: FormGroup;

	/**
	 * Archivos cargados por el usuario.
	 */
	files: File[] = [];

	bancosList: string[] = []; // Lista de bancos

	/**
	 * Vista previa de la imagen cargada por el usuario.
	 */
	imagePreview: string | ArrayBuffer | null = '';

	/**
	 * Índice de la pestaña seleccionada.
	 */
	selectedTabIndex = 0;

	/**
	 * Indica si se muestra la pestaña de información bancaria.
	 */
	isBankInfoVisible = false;

	countries: string[] = Countries();
	// Roles disponibles
	roles : rolModel[] = []

	constructor(
		private fb: FormBuilder,
		private dialog: MatDialog,
		public dialogRef: MatDialogRef<AddCollaboratorModalComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { collaborator: collaboratorModel, roles :rolModel[] }
	) {
		/**
		 * Crea el formulario con la información general del colaborador.
		 */
		this.roles = data.roles;
		this.collaboratorForm = this.fb.group(
			{
				name: ['', Validators.required],
				lastname: ['', Validators.required],
				description: [''],
				documentType: ['', Validators.required],
				documentNumber: ['', Validators.required],
				email: ['', [Validators.required, this.emailValidator()]],
				country: ['', Validators.required],
				department: ['', Validators.required],
				city: ['', Validators.required],
				address: ['', Validators.required],
				phone: ['', [Validators.required, this.phoneValidator()]],
				rol: ['', Validators.required],
				newPassword: [
					'',
					[Validators.required, this.passwordValidator()],
				],
				confirmPassword: ['', Validators.required],
				birthday: ['', [Validators.required]],
			},
			{ validators: this.passwordMatchValidator }
		);

		this.collabFormData = new FormData();

		/**
		 * Crea el formulario con la información bancaria del colaborador.
		 */
		this.bankForm = this.fb.group({
			accountType: ['', Validators.required],
			bank: ['', Validators.required],
			holderBank: ['', [Validators.required, Validators.maxLength(30)]],
			accountNumber: [
				'',
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(20),
				],
			],
		});
	}
	//Aqui empieza la logica para birthday
	get birthday() {
		return this.collaboratorForm.get('birthday');
	}

	validateDate() {
		this.birthday?.updateValueAndValidity();
	}

	getBirthDateErrorMessage() {
		if (this.birthday?.hasError('required')) {
			return ''; //La fecha de nacimiento es obligatoria
		} else if (this.birthday?.hasError('invalidFormat')) {
			return ''; //Formato inválido (dd/mm/aaaa)
		} else if (this.birthday?.hasError('invalidDate')) {
			return ''; //Fecha no válida
		}
		return '';
	}

	//Para evitar error si es birthday es nulo
	hasBirthDateError(): boolean {
		const control = this.birthday;
		return !!control && control.invalid && control.touched;
	}
	// Aqui termina las validaciones de birthday

	ngOnInit(): void {
		// Llama a la función bancos y almacena el resultado
		this.bancosList = bancos();
	}

	passwordMatchValidator(
		control: AbstractControl
	): { [key: string]: boolean } | null {
		const password = control.get('newPassword');
		const confirmPassword = control.get('confirmPassword');
		return password &&
			confirmPassword &&
			password.value !== confirmPassword.value
			? { passwordMismatch: true }
			: null;
	}

	passwordValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const password = control.value || '';
			const hasMinLength = password.length >= 8; // Verifica la longitud mínima
			const hasNumber = /\d/.test(password);
			const hasLowerCase = /[a-z]/.test(password);
			const hasUpperCase = /[A-Z]/.test(password);
			const valid =
				hasMinLength && hasNumber && hasLowerCase && hasUpperCase;

			return !valid
				? {
						passwordStrength:
							!hasNumber || !hasLowerCase || !hasUpperCase,
						minlength: !hasMinLength,
				  }
				: null;
		};
	}

	emailValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const email = control.value || '';
			const emailPattern =
				/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // RegEx estricta para correos válidos
			const valid = emailPattern.test(email);

			return !valid ? { invalidEmailDomain: true } : null;
		};
	}

	phoneValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const phone = control.value || '';
			const phonePattern = /^\+[1-9]\d{0,2}[1-9]\d{9,14}$/;
			const valid = phonePattern.test(phone);

			return !valid ? { invalidPhone: true } : null;
		};
	}
	/**
	 * Función llamada cuando el usuario arrastra un archivo a la zona de carga.
	 * @param event Evento de arrastre.
	 */
	async onFileDropped(event: any) {
		this.files = event.addedFiles;
		if (this.files.length > 0) {
			const file = this.files[0];
			const reader = new FileReader();

			reader.onload = (e: any) => {
				this.imagePreview = e.target.result;
			};
			reader.readAsDataURL(file);
			const optimizedImage = await OptimizeImg(this.files[0]);
			this.collabFormData.append('photo', optimizedImage);
		}
	}

	/**
	 * Función llamada cuando el usuario elimina un archivo de la zona de carga.
	 * @param file Archivo a eliminar.
	 */
	onRemove(file: File) {
		this.files = this.files.filter((f) => f !== file);
		this.imagePreview = '';
	}

	/**
	 * Función llamada cuando el usuario completa la información general del colaborador.
	 */
	next(): void {
		if (this.collaboratorForm.valid) {
			this.selectedTabIndex = 1;
			this.isBankInfoVisible = true;
		} else if (this.collaboratorForm.hasError('passwordMismatch')) {
			const errorMessage = 'La contraseñas no coinciden.';
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Error',
					message: errorMessage,
					isConfirm: false,
				},
			});
		}
	}

	/**
	 * Función llamada cuando el usuario completa la información bancaria del colaborador.
	 */
	saveInfo(): void {
		this.collabFormData.append('name', this.collaboratorForm.value.name);
		this.collabFormData.append(
			'lastname',
			this.collaboratorForm.value.lastname
		);
		this.collabFormData.append(
			'description',
			this.collaboratorForm.value.description
		);
		this.collabFormData.append(
			'documentType',
			this.collaboratorForm.value.documentType
		);
		this.collabFormData.append(
			'documentNumber',
			this.collaboratorForm.value.documentNumber
		);
		this.collabFormData.append('email', this.collaboratorForm.value.email);
		this.collabFormData.append(
			'country',
			this.collaboratorForm.value.country
		);
		this.collabFormData.append(
			'department',
			this.collaboratorForm.value.department
		);
		this.collabFormData.append('city', this.collaboratorForm.value.city);
		this.collabFormData.append(
			'address',
			this.collaboratorForm.value.address
		);
		this.collabFormData.append('phone', this.collaboratorForm.value.phone);
		this.collabFormData.append(
			'rol',
			this.collaboratorForm.value.rol
		);
		this.collabFormData.append(
			'password',
			this.collaboratorForm.value.newPassword
		);
		this.collabFormData.append(
			'birthday',
			formatDate(this.collaboratorForm.value.birthday)
		);
		this.collabFormData.append(
			'accountType',
			this.bankForm.value.accountType
		);
		this.collabFormData.append('bank', this.bankForm.value.bank);
		this.collabFormData.append(
			'holderBank',
			this.bankForm.value.holderBank
		);
		this.collabFormData.append(
			'accountNumber',
			this.bankForm.value.accountNumber
		);

		this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Bien hecho',
				message: 'Colaborador creado exitosamente.',
				isConfirm: false,
			},
		});
		this.dialogRef.close(this.collabFormData);
	}

	onInput(
		event: Event,
		length: number,
		control: any = '',
		fieldType: string = ''
	): void {
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
			inputElement.value = inputElement.value.replace(
				/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g,
				''
			);
		}
	}
}
