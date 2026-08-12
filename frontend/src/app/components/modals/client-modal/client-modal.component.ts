import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl,ValidationErrors } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

import { clientModel, complementModel } from '../../../pages/dashboard/clients/model/client.model';
import { serviceModel } from '../../../pages/dashboard/services/model/service.model';
import { rolModel } from '../../../pages/dashboard/roles/model/roles.model';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { formatDate, OptimizeImg, Countries,renameFile } from '../../../utils/Utils';
import { CustomDateAdapter } from '../../../utils/DateAdapter';
import { DateAdapter } from '@angular/material/core';

@Component({
	selector: 'app-client-modal',
	templateUrl: './client-modal.component.html',
	providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
})
export class ClientModalComponent {
	canAddComponent = true;
	canAddAccess = true;
	isUpdating = false;
	clientCreated = false;
	user: any; //Para separar las acciones dependiendo del rol
	// Índice actual de pestaña
	selectedTabIndex = 0;
	//Indice para cambio de tributarias/tributarys
	currentIndex = 0;
	clientForm: FormGroup;
	clientFormData: FormData = new FormData();
	tributaryForm: FormGroup;
	tributaryFormData: FormData = new FormData();
	countries: string[] = Countries();
	roles: rolModel[] = [];
	recurrency: number[] = [1, 2, 3, 4, 5, 6];

	servicesdisplayedColumns: string[] = [];
	componentsDisplayedColumns: string[] = [];
	accesosDisplayedColumns: string[] = [
		'type',
		'name',
		'user',
		'password',
		'url',
		'actions',
	];
	rut: File | null = null;
	c_commerce: File | null = null;
	dataSource: complementModel[] = [];
	dataSourceServices: complementModel[] = [];
	dataSourceAccess: any[] = [];

	serviceSType: serviceModel[] = [];
	serviceCType: serviceModel[] = [];
	//Para separar las categorias de wordpress
	groupedServiceTypes: { category: string; options: serviceModel[] }[] = [];

	files: File[] = [];
	imagePreview: string;

	editingRows: Set<any> = new Set();
	editingRowsService: Set<any> = new Set();
	editingRowsAccess = new Set<any>();
	// Para prevenir errores en caso de algún fallo en la carga
	isLoading = true;

	// Estados de visibilidad para pestañas
	isTributariaVisible = false;
	isShow = false;

	constructor(
		private fb: FormBuilder,
		private dialog: MatDialog,
		private apiService: ApiService,
		public dialogRef: MatDialogRef<ClientModalComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { client: clientModel; action: string; roles: rolModel[] }
	) {
		this.roles = data.roles;
		this.clientForm = this.fb.group({
			photo: [this.data.client.photo || ''],
			name: [this.data.client.name, Validators.required],
			lastname: [this.data.client.lastname, Validators.required],
			description: [this.data.client.description],
			documentType: [this.data.client.documentType, Validators.required],
			documentNumber: [
				this.data.client.documentNumber,
				Validators.required,
			],
			email: [
				this.data.client.email,
				[Validators.required, this.emailValidator()],
			],
			country: [this.data.client.country, Validators.required],
			department: [this.data.client.department, Validators.required],
			city: [this.data.client.city, Validators.required],
			address: [this.data.client.address, Validators.required],
			phone: [
				this.data.client.phone,
				[Validators.required, this.phoneValidator()],
			],
			rol: [this.data.client.rol, Validators.required],
			birthday: [
				formatDate(this.data.client.birthday, 4),
				[Validators.required],
			], // <-- Aqui se agrega el campo para cumpleaños
		});
		this.imagePreview = this.data.client.photo || '';

		this.clientCreated = this.data.action === 'update' ? true : false;

		this.tributaryForm = this.fb.group({
			tributarys: this.fb.array([this.createTributariaGroup()]),
		});

		//para cambiar el modo habilirar pestañas en edicion para tributario
		if (this.data.action == 'update') {
			this.isShow = true;
			this.isTributariaVisible = true;
		}
	}

	//Los colaboradores asignados quemados
	collaborators = [{ email: '', fullname: '' }];

	//tributaria
	createTributariaGroup(data?: any): FormGroup {
		return this.fb.group(
			{
				id: [data?.id || ''],
				corporate_name: [
					data?.corporate_name || '',
					Validators.required,
				],
				company_name: [data?.company_name || '', Validators.required],
				taxpayer_type: [data?.taxpayer_type || '', Validators.required],
				tributary_id: [data?.tributary_id || '', Validators.required],
				tributary_number: [
					data?.tributary_number || '',
					Validators.required,
				],
				tax_liability: [data?.tax_liability || '', Validators.required],
				tax_id_type: [data?.tax_id_type || '', Validators.required],
				regime_type: [data?.regime_type || '', Validators.required],
				rut: [data?.rut || ''],
				c_commerce: [data?.c_commerce || ''],
			},
			{
				validators: this.tributaryNumberValidator(),
			}
		);
	}

	get tributarys(): FormArray {
		return this.tributaryForm.get('tributarys') as FormArray;
	}

	prevTributaria() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
		}
	}

	nextTributaria() {
		if (this.currentIndex < this.tributarys.length - 1) {
			this.currentIndex++;
		}
	}

	addOtraTributaria(): void {
		this.tributarys.push(this.createTributariaGroup());
		this.currentIndex = this.tributarys.length - 1; // Ir al nuevo automáticamente
	}
	async removeTributaria(index: number) {
		if (this.tributarys.length > 1) {
			const id = this.tributarys.at(index)?.get('id')?.value;
			this.tributarys.removeAt(index);
			// Desde aqui se ajustar el índice actual si es necesario
			if (this.currentIndex >= this.tributarys.length) {
				this.currentIndex = this.tributarys.length - 1;
			}
			try {
				const data = await firstValueFrom(
					this.apiService.getData(
						`clients/${this.data.client.id}/tributary/${id}`
					)
				);
				this.dataSourceAccess = [...data];
			} catch (error) {
				console.error('Fail:', error);
			}
		}
	}

	typeOptions = [
		{ value: 'H', viewValue: 'Herramienta' },
		{ value: 'S', viewValue: 'Social' },
		{ value: 'C', viewValue: 'Complemento' },
		{ value: 'T', viewValue: 'Temas' },
		{ value: 'O', viewValue: 'Web' },
	];

	//Aqui empieza la logica para birthday
	get birthday() {
		return this.clientForm.get('birthday');
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

	getTypeViewValue(type: string): string {
		const typeOption = this.typeOptions.find(
			(option) => option.value === type
		);
		return typeOption ? typeOption.viewValue : '';
	}

	async ngOnInit() {
		// Carga el usuario desde localStorage
		const userString = localStorage.getItem('user') || '';
		this.user = JSON.parse(userString);

		// Define columnas base
		this.servicesdisplayedColumns = [
			'service',
			'startDate',
			'currency',
			'price',
			'is_recurrent',
			'is_payed',
		];
		this.componentsDisplayedColumns = [
			'service',
			'startDate',
			'currency',
			'price',
			'is_recurrent',
			'is_payed',
		];

		// Solo agrega la columna de acciones si el usuario es Super Admin
		if (this.user?.rol === 'Super Admin') {
			this.servicesdisplayedColumns.push('actions'); // Para servicios
			this.componentsDisplayedColumns.push('actions'); // Para todo wordpress
		}

		// Lógica existente
		await this.getServices(); // Carga las opciones disponibles
		if (this.data.action == 'update') {
			await this.getAssignedColab();
			await this.getCliServices();
		}
		this.isLoading = false;
	}

	emailValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const email = control.value || '';
			const emailPattern =
				/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			const valid = emailPattern.test(email);

			return !valid ? { invalidEmailDomain: true } : null;
		};
	}

	tributaryNumberValidator(): ValidatorFn {
		return (formGroup: AbstractControl): ValidationErrors | null => {
			const tributaryId = formGroup.get('tributary_id')?.value;
			const tributaryNumber = formGroup.get('tributary_number');

			if (tributaryId !== 'N/A' && !tributaryNumber?.value) {
				tributaryNumber?.setErrors({ required: true });
				return { tributaryInvalid: true };
			}
			// Si el campo no debe ser obligatorio, eliminamos errores existentes
			if (tributaryId === 'N/A') {
				tributaryNumber?.setErrors(null);
			}
			return null;
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

	onTabChange(event: any): void {
		if (event.index === 1) {
			this.getAddTributarys();
		} else if (event.index === 2 || event.index === 3) {
			this.getCliServices();
		} else if (event.index === 4) {
			this.getAccess();
		}
		this.editingRows = new Set();
		this.editingRowsService = new Set();
		this.editingRowsAccess = new Set();
		this.canAddComponent = true;
	}

	async getAccess() {
		try {
			const data = await firstValueFrom(
				this.apiService.getData(`clients/${this.data.client.id}/Access`)
			);
			this.dataSourceAccess = [...data];
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	editRowAccess(element: any): void {
		const hasEditingRow = Array.from(this.editingRowsAccess).some(
			(item: any) => item.isEditing
		);

		if (hasEditingRow) {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'No se puede editar esta fila porque hay otra fila en edición.',
					isConfirm: false,
				},
			});
			return;
		}

		this.editingRowsAccess.add(element);

		element.isEditing = true;

		this.isUpdating = true;
	}

	async saveAccess(element: any) {
		if (this.isRowCompleteAccess(element)) {
			this.editingRowsAccess.delete(element);
			element.client = this.data.client.id;

			try {
				const data = await firstValueFrom(
					this.apiService.postData(
						`clients/${this.data.client.id}/Access`,
						element
					)
				);
				element.id = data.id;

				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Acceso guardado exitosamente.',
						isConfirm: false,
					},
				});
			} catch (error: any) {
				console.error('Fail:', error);

				const errorMessage = error?.error?.message;

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
					title: 'Advertencia',
					message:
						'La fila no está completa. No se puede guardar el acceso.',
					isConfirm: false,
				},
			});
		}
		this.canAddAccess = true;
	}

	isRowCompleteAccess(element: any): boolean {
		return (
			element.type &&
			element.name &&
			element.user &&
			element.password &&
			element.url
		);
	}

	async removeAccess(element: any) {
		if (!element.id) {
			this.editingRowsAccess = new Set();
			this.dataSourceAccess.pop();
			this.dataSourceAccess = [...this.dataSourceAccess];
			return;
		}

		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message: '¿Estás seguro de que deseas eliminar este acceso?',
				isConfirm: true,
			},
		});

		const result = await firstValueFrom(confirmDialogRef.afterClosed());

		if (result) {
			const index = this.dataSourceAccess.indexOf(element);

			if (index >= 0) {
				this.dataSourceAccess.splice(index, 1);
				this.dataSourceAccess = [...this.dataSourceAccess];

				try {
					await firstValueFrom(
						this.apiService.deleteData(
							`clients/${this.data.client.id}/Access/${element.id}`
						)
					);

					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Bien hecho',
							message: 'Acceso eliminado correctamente.',
							isConfirm: false,
						},
					});
				} catch (error: any) {
					const errorMessage =
						error?.error?.message ||
						error?.message ||
						'Error desconocido. Inténtalo nuevamente.';

					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Error',
							message: `Ocurrió un error: ${errorMessage}`,
							isConfirm: false,
						},
					});

					console.error('Error al eliminar el acceso:', error);
				}
			}
			this.canAddAccess = true;
		} else {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Cancelado',
					message: 'La eliminación ha sido cancelada.',
					isConfirm: false,
				},
			});
		}
	}

	async updateAccess(element: any) {
		if (this.isRowCompleteAccess(element)) {
			this.isUpdating = true;

			try {
				const data = await firstValueFrom(
					this.apiService.putData(
						`clients/${this.data.client.id}/Access/${element.id}`,
						element
					)
				);

				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Acceso actualizado exitosamente.',
						isConfirm: false,
					},
				});
			} catch (error) {
				console.error('Fail:', error);
			} finally {
				this.isUpdating = false;
				this.editingRowsAccess.delete(element);
			}
		} else {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'La fila no está completa. No se puede actualizar el acceso.',
					isConfirm: false,
				},
			});
		}
	}

	addAccess(): void {
		const hasEditingRow = Array.from(this.editingRowsAccess).some(
			(item: any) => item.isEditing
		);

		if (hasEditingRow) {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'No puede añadir una nueva celda porque hay una fila en edición. Finalice o cierre la edición actual.',
					isConfirm: false,
				},
			});
			return;
		}

		if (!this.canAddAccess && this.editingRowsAccess.size > 0) {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'No puede añadir más celdas hasta que complete la existente.',
					isConfirm: false,
				},
			});
			return;
		}

		const newAccess = {
			type: '',
			name: '',
			user: '',
			password: '',
			url: '',
			isEditing: true,
		};

		this.dataSourceAccess = [...this.dataSourceAccess, newAccess];
		this.editingRowsAccess.add(newAccess);

		this.canAddAccess = this.dataSourceAccess.length === 1;
	}

	formatUrl(url: string): string {
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}
		return `https://${url}`;
	}
	// funciones de servicios y wordpress
	async getServices() {
		const data = await firstValueFrom(
			this.apiService.getData(`services/filtered`)
		);

		this.serviceSType = data.servService;
		this.serviceCType = data.servWord;

		// Agrupar por categoría
		const groupMap = this.serviceCType.reduce((acc, item) => {
			const key = item.category;
			if (!acc.has(key)) acc.set(key, []);
			acc.get(key)!.push(item);
			return acc;
		}, new Map<string, serviceModel[]>());

		this.groupedServiceTypes = Array.from(
			groupMap,
			([category, options]) => ({
				category,
				options,
			})
		);
	}

	async getCliServices() {
		try {
			const data = await firstValueFrom(
				this.apiService.getData(
					`clients/${this.data.client.id}/clientservices`
				)
			);

			this.data.client.services = data.servicios;
			this.data.client.complements = data.wordpress;

			this.dataSource = [...data.wordpress];
			this.dataSourceServices = [...data.servicios];
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	getPlaceholderText(element: any): string {
		return element.service ? element.name : 'Selecciona un tipo';
	}

	async getAddTributarys() {
		if (this.data.action == 'update') {
			try {
				const data = await firstValueFrom(
					this.apiService.getData(
						`clients/${this.data.client.id}/tributary`
					)
				);
				this.data.client.tributarys = data;
			} catch (error) {
				console.error('Fail:', error);
			}
		}

		const tributaryFormArray = this.fb.array<FormGroup>([]);
		// Si hay tributarias adicionales, agregarlas
		if (
			this.data.client.tributarys &&
			this.data.client.tributarys.length > 0
		) {
			this.data.client.tributarys.forEach((t: any) => {
				tributaryFormArray.push(this.createTributariaGroup(t));
			});
		} else {
			tributaryFormArray.push(this.createTributariaGroup());
		}

		// Asignar al formulario principal
		this.tributaryForm = this.fb.group({
			tributarys: tributaryFormArray,
		});
	}

	async getAssignedColab() {
		const data = await firstValueFrom(
			this.apiService.getData(`users/simple-cfc/${this.data.client.id}`)
		);
		this.collaborators = data;
	}

	async removeTributaryFile(arch: string) {
		try {
			const id = this.tributarys.at(this.currentIndex).get('id')?.value;
			const data = await firstValueFrom(
				this.apiService.postData(`clients/tributary/delete_file`, {
					id: id,
					field: arch,
				})
			);
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	removeClient(): void {
		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message: '¿Estás seguro de que deseas eliminar este cliente?',
				isConfirm: true,
			},
		});

		confirmDialogRef.afterClosed().subscribe(async (result) => {
			if (result) {
				try {
					await firstValueFrom(
						this.apiService.deleteData(
							`clients/${this.data.client.id}`
						)
					);

					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Bien hecho',
							message: 'Cliente eliminado exitosamente.',
							isConfirm: false,
						},
					});

					this.dialogRef.close({
						deleted: true,
						id: this.data.client.id,
					});
				} catch (error: any) {
					const errorMessage =
						error?.error?.message ||
						error?.message ||
						'Error desconocido. Inténtalo nuevamente.';

					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Error',
							message: `Ocurrió un error: ${errorMessage}`,
							isConfirm: false,
						},
					});

					console.error('Error al eliminar el cliente:', error);
				}
			} else {
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Cancelado',
						message: 'La eliminación ha sido cancelada.',
						isConfirm: false,
					},
				});
			}
		});
	}
	// Función para avanzar a la siguiente pestaña
	goToTributaryTab() {
		if (this.clientForm.valid) {
			this.selectedTabIndex = 1; // Mover a la pestaña "Tributaria"
			this.isTributariaVisible = true; // Habilitar la pestaña Tributaria
		}
	}

	addDataClient() {
		this.clientFormData.append('id', '' + this.data.client.id);
		this.clientFormData.append('name', this.clientForm.value.name);
		this.clientFormData.append('lastname', this.clientForm.value.lastname);
		this.clientFormData.append(
			'description',
			this.clientForm.value.description
		);
		this.clientFormData.append(
			'documentType',
			this.clientForm.value.documentType
		);
		this.clientFormData.append(
			'documentNumber',
			this.clientForm.value.documentNumber
		);
		this.clientFormData.append('email', this.clientForm.value.email);
		this.clientFormData.append('country', this.clientForm.value.country);
		this.clientFormData.append('birthday', formatDate(this.clientForm.value.birthday));
		this.clientFormData.append(
			'department',
			this.clientForm.value.department
		);
		this.clientFormData.append('city', this.clientForm.value.city);
		this.clientFormData.append('address', this.clientForm.value.address);
		this.clientFormData.append('phone', this.clientForm.value.phone);
		this.clientFormData.append('rol', this.clientForm.value.rol);
	}

	addDataTributary() {
		const allTributaries = this.tributaryForm.value.tributarys;
		allTributaries.forEach((tributary: any, index: number) => {
			// Campos obligatorios
			this.tributaryFormData.append(
				`tributaries[${index}][id]`,
				tributary.id || ''
			);
			this.tributaryFormData.append(
				`tributaries[${index}][corporate_name]`,
				tributary.corporate_name
			);
			this.tributaryFormData.append(
				`tributaries[${index}][company_name]`,
				tributary.company_name
			);
			this.tributaryFormData.append(
				`tributaries[${index}][taxpayer_type]`,
				tributary.taxpayer_type
			);
			this.tributaryFormData.append(
				`tributaries[${index}][tributary_id]`,
				tributary.tributary_id
			);
			this.tributaryFormData.append(
				`tributaries[${index}][tributary_number]`,
				tributary.tributary_number
			);
			this.tributaryFormData.append(
				`tributaries[${index}][tax_liability]`,
				tributary.tax_liability
			);
			this.tributaryFormData.append(
				`tributaries[${index}][tax_id_type]`,
				tributary.tax_id_type
			);
			this.tributaryFormData.append(
				`tributaries[${index}][regime_type]`,
				tributary.regime_type
			);
			// Archivos opcionales: solo si existen
			if (tributary.rut instanceof File) {
				this.tributaryFormData.append(
					`tributaries[${index}][rut]`,
					tributary.rut
				);
			}
			if (tributary.c_commerce instanceof File) {
				this.tributaryFormData.append(
					`tributaries[${index}][c_commerce]`,
					tributary.c_commerce
				);
			}
		});
	}

	saveGeneralInfo(origin: string = ''): void {
		if (this.data.action === 'update') {
			// Esta editando
			if (origin == 'tributario') {
				this.addDataTributary();
			} else {
				this.addDataClient();
			} // cliente
		} else {
			// Esta creando, viene de tributary. enviar client y tributary
			this.addDataClient();
			this.addDataTributary();
		}
		const message =
			this.data.action === 'update'
				? 'Información actualizada exitosamente.'
				: 'Has creado un nuevo cliente.';

		this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Bien hecho',
				message,
				isConfirm: false,
			},
		});

		this.dialogRef.close({
			clientFormData: this.clientFormData,
			tributaryFormData: this.tributaryFormData,
			client_id: this.data.client.id,
			origin: origin,
		});
	}

	editRow(element: any, accion: string): void {
		let Source =
			accion === 'service' ? this.dataSourceServices : this.dataSource;
		let Row =
			accion === 'service' ? this.editingRowsService : this.editingRows;

		const hasEditingRow = Array.from(Row).some(
			(item: any) => item.isEditing
		);

		if (hasEditingRow) {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'No se puede editar esta fila porque hay otra fila en edición.',
					isConfirm: false,
				},
			});
			return;
		}

		Row.add(element);

		const index = Source.indexOf(element);
		if (index !== -1) {
			let val = Source[index];
			let star = (val.startDate = formatDate(
				formatDate(val.startDate, 2),
				3
			));
			let expi = (val.expirationDate = formatDate(
				formatDate(val.expirationDate, 2),
				3
			));
			val = { ...element, startDate: star, expirationDate: expi };
			Source = [...Source];
		}

		element.isEditing = true;
		this.isUpdating = true;
	}

	async updateService(element: any, accion: string) {
		if (this.isRowCompleteService(element)) {
			element.startDate = formatDate(element.startDate);
			element.expirationDate = formatDate(element.expirationDate);

			try {
				const data = await firstValueFrom(
					this.apiService.putData(
						`clients/${this.data.client.id}/clientservices/${element.id}`,
						element
					)
				);

				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Actualizado correctamente.',
						isConfirm: false,
					},
				});
			} catch (error) {
				console.error('Error al actualizar:', error);
			}

			element.isEditing = false;
			this.canAddComponent = true;
			this.isUpdating = false;
			this.getCliServices();
		} else {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'La fila no está completa. No se puede actualizar.',
					isConfirm: false,
				},
			});
		}
	}

	async saveService(element: any, accion: string) {
		if (this.isRowCompleteService(element)) {
			element.startDate = formatDate(element.startDate);
			try {
				let newData;
				if (!element.is_recurrent) {
					const { expirationDate, recurrence, Nrecurrency, ...rest } =
						element;
					newData = rest;
				} else {
					const { expirationDate, ...rest } = element;
					newData = rest;
				}
				delete element.expirationDate;

				const data = await firstValueFrom(
					this.apiService.postData(
						`clients/${this.data.client.id}/clientservices`,
						newData
					)
				);

				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Guardado correctamente.',
						isConfirm: false,
					},
				});
			} catch (error) {
				console.error('Error al guardar:', error);
			}

			this.editingRows.delete(element);

			element.isEditing = false;
			this.canAddComponent = true;
			this.getCliServices();
		} else {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message: 'La fila no está completa. No se puede guardar.',
					isConfirm: false,
				},
			});
		}
	}

	async removeService(element: any, accion: string) {
		if (!element.id) {
			if (accion == 'service') {
				this.editingRowsService = new Set();
				this.dataSourceServices.pop();
				this.dataSourceServices = [...this.dataSourceServices];
			} else {
				this.editingRows = new Set();
				this.dataSource.pop();
				this.dataSource = [...this.dataSource];
			}
			return;
		}

		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message: `¿Estás seguro de que deseas eliminar esta fila?`,
				isConfirm: true,
			},
		});

		const result = await firstValueFrom(confirmDialogRef.afterClosed());

		if (result) {
			try {
				await firstValueFrom(
					this.apiService.deleteData(
						`clients/${this.data.client.id}/clientservices/${element.id}`
					)
				);

				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Se elimino correctamente.',
						isConfirm: false,
					},
				});

				this.canAddComponent = true;
				this.getCliServices();
			} catch (error: any) {
				const errorMessage =
					error?.error?.message ||
					error?.message ||
					'Error desconocido. Inténtalo nuevamente.';

				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Error',
						message: `Ocurrió un error: ${errorMessage}`,
						isConfirm: false,
					},
				});

				console.error('Error al eliminar:', error);
			}
		} else {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Cancelado',
					message: 'La eliminación ha sido cancelada.',
					isConfirm: false,
				},
			});
		}
	}

	isRowCompleteService(element: any): boolean {
		return (
			element.service &&
			element.startDate &&
			element.price !== null &&
			(!element.is_recurrent ||
				(element.is_recurrent && element.recurrence))
		);
	}
	addComponent(accion: string): void {
		const source =
			accion === 'service' ? this.dataSourceServices : this.dataSource;
		const row =
			accion === 'service' ? this.editingRowsService : this.editingRows;

		const hasEditingRow = Array.from(row).some(
			(item: any) => item.isEditing
		);

		if (hasEditingRow) {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'No se pueden añadir más celdas. Hay una fila en edición.',
					isConfirm: false,
				},
			});
			return;
		}

		if (!this.canAddComponent && row.size > 0) {
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Advertencia',
					message:
						'No se pueden añadir más celdas. Complete las filas existentes primero.',
					isConfirm: false,
				},
			});
			return;
		}

		const newElement = {
			service: NaN,
			startDate: '',
			expirationDate: '',
			price: NaN,
			is_recurrent: false,
			isEditing: true,
			isNew: true, // Indicar que esta fila es nueva
		};

		if (accion === 'service') {
			this.dataSourceServices = [...source, newElement];
			this.editingRowsService = new Set(this.editingRowsService).add(
				newElement
			);
		} else {
			this.dataSource = [...source, newElement];
			this.editingRows = new Set(this.editingRows).add(newElement);
		}

		this.canAddComponent = false;
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
			this.clientFormData.append('photo', optimizedImage);
		}
	}

	onRemoveFile(file: File): void {
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

	//Rut y camara de comercio
	onRutDropped(event: any) {
		const file = event.addedFiles[0];
		const newFileName = renameFile(
			file,
			'rut',
			this.tributaryForm.value.tributarys.at(this.currentIndex)
		);
		this.rut = newFileName;
		this.tributarys.at(this.currentIndex).get('rut')?.setValue(newFileName);
	}

	onRemoveArch(arch: string = 'rut') {
		if (arch == 'rut') {
			this.rut = null;
		} else {
			this.c_commerce = null;
		}
		this.tributarys.at(this.currentIndex).get(arch)?.setValue('');
		const archiv = this.data.client.tributarys[this.currentIndex][arch];
		if (this.data.action == 'update' && archiv) {
			this.removeTributaryFile(arch);
		}
	}

	onDownload(arch: string) {
		if (this.HayFile(arch) != '') {
			const a = document.createElement('a');
			a.href = this.HayFile(arch);
			a.download = this.getFileName(this.HayFile(arch));
			a.target = '_blank';
			a.click();
		}
	}

	onCommerceDropped(event: any) {
		const file = event.addedFiles[0];
		const newFileName = renameFile(
			file,
			'cc',
			this.tributaryForm.value.tributarys.at(this.currentIndex)
		);
		this.c_commerce = newFileName;
		this.tributarys
			.at(this.currentIndex)
			.get('c_commerce')
			?.setValue(newFileName);
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

	getFileName(url: string) {
		return url.substring(url.lastIndexOf('/') + 1);
	}
	HayFile(arch: string = 'rut') {
		return this.tributarys.at(this.currentIndex).get(arch)?.value;
	}
	HasFile(arch: string = 'rut'): boolean {
		const val = this.data?.client?.tributarys?.at(this.currentIndex)?.[
			arch
		];
		if (val != '' && val != null) {
			return true;
		} else {
			return false;
		}
	}
	ViewFile(arch: string = 'rut'): boolean {
		if (this.data.action == 'update') {
			return this.HayFile(arch) != '';
		} else {
			if (arch == 'rut') {
				return this.rut ? true : false;
			} else {
				return this.c_commerce ? true : false;
			}
		}
	}
}


