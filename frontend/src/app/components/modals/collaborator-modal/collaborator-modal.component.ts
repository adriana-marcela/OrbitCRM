import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

import { collaboratorModel } from '../../../pages/dashboard/collaborators/model/collaborator.model';
import { serviceModel } from '../../../pages/dashboard/services/model/service.model';

import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { bancos, Countries, OptimizeImg, formatDate } from '../../../utils/Utils';
import { rolModel } from '../../../pages/dashboard/roles/model/roles.model';

@Component({
	selector: 'app-collaborator-modal',
	templateUrl: './collaborator-modal.component.html',
})
export class CollaboratorModalComponent {
	files: File[] = [];
	imagePreview: string;
	// clientes
	clients: any[] = []
	dataSourceClients: any[] = [];
	addAssigendClient: boolean = false;
	clientsDisplayedColumns: string[] = ['fullname', 'corporate', 'actions'];
	// Lista de bancos disponibles
	bancosList: string[] = [];
	// Formulario para editar la información general del colaborador
	collaboratorForm: FormGroup;
	collabFormData: FormData;
	// Formulario para editar la información bancaria del colaborador
	bankForm: FormGroup;
	// Servicios que se pueden asignar al colaborador
	services: serviceModel[] = [];
	// Países disponibles
	countries: string[] = Countries();
	// Roles disponibles
	roles : rolModel[] = []

	constructor(
		private fb: FormBuilder,
		private dialog: MatDialog,
		private apiService: ApiService,
		public dialogRef: MatDialogRef<CollaboratorModalComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { collaborator: collaboratorModel, roles :rolModel[]},
	) {
		this.roles = data.roles;
		this.dataSourceClients = [...(data?.collaborator?.assigned_clients ?? [])];
		this.collaboratorForm = this.fb.group({
			name: [this.data.collaborator.name, Validators.required],
			lastname: [this.data.collaborator.lastname, Validators.required],
			description: [this.data.collaborator.description],
			documentType: [
				this.data.collaborator.documentType,
				Validators.required,
			],
			documentNumber: [
				this.data.collaborator.documentNumber,
				Validators.required,
			],
			email: [
				this.data.collaborator.email,
				[Validators.required, this.emailValidator()],
			],
			country: [this.data.collaborator.country, Validators.required],
			department: [
				this.data.collaborator.department,
				Validators.required,
			],
			city: [this.data.collaborator.city, Validators.required],
			address: [this.data.collaborator.address, Validators.required],
			phone: [
				this.data.collaborator.phone,
				[Validators.required, this.phoneValidator()],
			],
			rol: [this.data.collaborator.rol, Validators.required],
			birthday: [formatDate(this.data.collaborator.birthday, 4), [Validators.required]],
		});

		this.collabFormData = new FormData();

		this.imagePreview = this.data.collaborator.photo || '';

		this.bankForm = this.fb.group({
			accountType: [
				this.data.collaborator.accountType,
				Validators.required,
			],
			bank: [this.data.collaborator.bank, Validators.required],
			holderBank: [
				this.data.collaborator.holderBank,
				[Validators.required, Validators.maxLength(30)],
			],
			accountNumber: [
				this.data.collaborator.accountNumber,
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(20),
				],
			],
		});
	}

	// Validador para el campo de correo electrónico
	emailValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const email = control.value || '';
			const emailPattern =
				/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			const valid = emailPattern.test(email);

			return !valid ? { invalidEmailDomain: true } : null;
		};
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

	phoneValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const phone = control.value || '';
			const phonePattern = /^\+[1-9]\d{0,2}[1-9]\d{9,14}$/;
			const valid = phonePattern.test(phone);

			return !valid ? { invalidPhone: true } : null;
		};
	}
	// Se llama cuando se cambia de pestaña
	onTabChange(event: any) {
		if (event.index === 1) {
			this.getServices();
		}
		else if(event.index === 2){
			this.getClients();
		}
	}

	// Obtiene la lista de servicios disponibles
	async getServices() {
		this.services = await firstValueFrom(
			this.apiService.getData(`services`)
		);
	}

	async getClients() {
		try {
			const data = await firstValueFrom(
				this.apiService.getData(`clients/simple`)
			);
			this.clients = [...data];
		} catch (error) {
			console.error('Fail:', error);
		}
	}
	async getAssignedClients() {
		try {
			const data = await firstValueFrom(
				this.apiService.getDataE(`users/admin/assign/?user=${this.data.collaborator.email}`)
			);
			const assignedIds = data[0].assigned_clients;
			const filteredClients = this.clients.filter(client => assignedIds.includes(client.id));
			this.dataSourceClients = [...filteredClients];

		} catch (error) {
			console.error('Fail:', error);
		}
	}

	// Se llama cuando se inicializa el componente
	ngOnInit(): void {
		this.bancosList = bancos();
	}

	// Elimina el colaborador
	deleteCollaborator(): void {
		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message:
					'¿Estás seguro de que deseas eliminar este colaborador?',
				isConfirm: true,
			},
		});

		confirmDialogRef.afterClosed().subscribe(async (result) => {
			if (result) {
				try {
					await firstValueFrom(
						this.apiService.deleteData(
							`users/${this.data.collaborator.email}/delete`
						)
					);

					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Bien hecho',
							message: 'Colaborador eliminado exitosamente.',
							isConfirm: false,
						},
					});

					this.dialogRef.close();
				} catch (error: any) {
					const errorMessage =
						'Error al procesar la solicitud: ' + error.message;
					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Error',
							message: errorMessage,
							isConfirm: false,
						},
					});
				}
			} else {
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Cancelado',
						message: 'Eliminación cancelada.',
						isConfirm: false,
					},
				});
			}
		});
	}

	addToForm(): void {
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
		this.collabFormData.append('birthday', formatDate(this.collaboratorForm.value.birthday));
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
	}

	// Guarda la información general del colaborador
	async saveGeneralInfo(): Promise<void> {
		this.addToForm();

		try {
			await firstValueFrom(
				this.apiService.putData(
					`users/${this.data.collaborator.email}`,
					this.collabFormData
				)
			);
		} catch (error) {
			console.error('Error al guardar colaborador:', error);
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'No se pudo guardar',
					message:
						'Ocurrió un error al guardar la información. Revisa los datos e inténtalo de nuevo.',
					isConfirm: false,
				},
			});
			return; // No cierra el modal, así puedes corregir y reintentar.
		}

		const successDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Bien hecho',
				message: 'Información general actualizada exitosamente.',
				isConfirm: false,
			},
		});

		successDialogRef.afterClosed().subscribe(() => {
			this.dialogRef.close({ success: true });
		});
	}

	// Guarda la información bancaria del colaborador
	saveBankInfo(): void {
		this.addToForm();

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

		const updatedCollaborator: collaboratorModel = {
			...this.data.collaborator,
			accountType: this.bankForm.value.accountType,
			bank: this.bankForm.value.bank,
			holderBank: this.bankForm.value.holderBank,
			accountNumber: this.bankForm.value.accountNumber,
		};

		const successDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Bien hecho',
				message: 'Información bancaria actualizada exitosamente.',
				isConfirm: false,
			},
		});

		successDialogRef.afterClosed().subscribe(() => {
			this.dialogRef.close(this.collabFormData);
		});
	}

	addClient(){
		const newClient = {
			fullname: '',
			corporate: '',
			new: true
		}
		this.addAssigendClient = true;
		this.dataSourceClients = [newClient, ...this.dataSourceClients];
	}
	async removeClient(element: any, isNew: boolean){
		if(!isNew){
			try {
			const cl = {
				user: this.data.collaborator.email,
  				client_id: element.id
			}
			const data = await firstValueFrom(
				this.apiService.postData(`users/admin/assign/remove-client`,cl)
			);
			} catch (error) {
				console.error('Fail:', error);
			}
		}
		else{this.dataSourceClients.shift();}
		this.getAssignedClients();
	}

	async saveClient(element: any){
		try {
			const data = {
				user: this.data.collaborator.email,
				assigned_clients: [element.id]
			}
			await firstValueFrom(
				this.apiService.postData(`users/admin/assign`, data)
			);
		} catch (error) {
			console.error('Fail:', error);
		}
		this.addAssigendClient = false;
		this.getAssignedClients();
	}

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

	onRemove(file: File): void {
		this.files = this.files.filter((f) => f !== file);
		this.imagePreview = '';
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

