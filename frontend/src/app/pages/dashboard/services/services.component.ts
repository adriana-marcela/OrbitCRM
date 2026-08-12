import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FormControl } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';
import { serviceModel } from './model/service.model';

import { ServiceModalComponent } from '../../../components/modals/service-modal/service-modal.component';
import { ConfirmationModalComponent } from '../../../components/modals/confirmation-modal/confirmation-modal.component';

import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-services',
	standalone: true,
	imports: [SharedModule],
	templateUrl: './services.component.html',
})
export class ServicesComponent {
	/**
	 * Almacena la lista de servicios
	 */
	serviceItems: serviceModel[] = [];
	filteredServices: serviceModel[] = [];
	emptyService: serviceModel = {
		img: '',
		name: '',
		description: '',
		category: '',
		url: '',
	};
	viewMode: 'grid' | 'list' = 'grid';
	errorMessage: string = '';
	user:any;
	/**
	 * Variables para el paginador
	 */
	pageSize = 100;
	pageIndex = 0;

	// Agregamos el FormControl para el filtro
	nameFilter = new FormControl('');

	/**
	 * Constructor del componente
	 *
	 * @param dialog Servicio para mostrar modales
	 * @param apiService Servicio para interactuar con la API
	 */
	constructor(private dialog: MatDialog, private apiService: ApiService) {}

	/**
	 * Inicializa el componente
	 */
	ngOnInit(): void {
		this.getItems();
		const us = localStorage.getItem('user') || "";
        this.user = JSON.parse(us);
		this.nameFilter.valueChanges.subscribe((value) => {
			this.filterServices(value || '');
		});
	}

	toggleView(mode: 'grid' | 'list') {
		this.viewMode = mode;
	}

	/**
	 * Obtiene la lista de servicios
	 */
	async getItems() {
		try {
			//const data = await firstValueFrom(
			const data: serviceModel[] = await firstValueFrom( //Se cambio porque se tenia que tipar la respuesta de la API para que Ts sepa que data es un array de serviceModel y no me saliera error al ordenarlo alfabeticamente
				this.apiService.getData(`services`)
			);
			// Ordena alfabéticamente por el campo 'name'
			data.sort((a, b) => a.name.localeCompare(b.name));

			this.serviceItems = [...data];
			this.filteredServices = [...data];
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	// Método para filtrar los servicios según el texto ingresado en el filtro
	filterServices(value: string) {
		if (value) {
			this.filteredServices = this.serviceItems.filter(
				(service) =>
					service.name.toLowerCase().includes(value.toLowerCase()) ||
					service.category
						.toLowerCase()
						.includes(value.toLowerCase()) ||
					service.description
						.toLowerCase()
						.includes(value.toLowerCase())
			);
		} else {
			this.filteredServices = [...this.serviceItems];
		}
	}

	// Método para manejar el cambio de página
	onPageChange(event: any): void {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
	}

	// Método para manejar el cambio de tamaño de página
	onPageSizeChange(value: number): void {
		this.pageSize = value;
	}

	/**
	 * Abre el modal para agregar o editar un servicio
	 *
	 * @param service Servicio a editar (opcional)
	 */
	openServiceModal(
		service: serviceModel = this.emptyService,
		errorMessage: string = ''
	): void {
		if(this.user.is_staff && this.user.rol != "Colaborador"){
				const dialogRef = this.dialog.open(ServiceModalComponent, {
				width: '500px',
				data: { service, errorMessage },
			});

			dialogRef.afterClosed().subscribe((result) => {
				if (result) {
					if (result.action === 'add') {
						this.addService(result.data);
					} else if (result.action === 'edit') {
						this.editService(result.data);
					} else if (result.action === 'delete') {
						this.deleteService(result.data);
					}
				}
			});
		}
	}

	/**
	 * Agrega un nuevo servicio
	 *
	 * @param newService Servicio a agregar
	 */
	async addService(newService: FormData): Promise<void> {
		if (newService) {
			try {
				const data = await firstValueFrom(
					this.apiService.postData('services', newService)
				);
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Servicio creado exitosamente.',
						isConfirm: false,
					},
				});

				this.getItems();
			} catch (error: any) {
				this.errorMessage =
					'Error al procesar la solicitud: ' + error.message;
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Error',
						message: this.errorMessage,
						isConfirm: false,
					},
				});
			}
		} else {
			console.error(
				'Error al agregar el servicio:',
				'No se encontró el servicio a agregar'
			);
		}
	}

	/**
	 * Edita un servicio existente
	 *
	 * @param updatedService Servicio a editar
	 */
	async editService(updatedService: FormData): Promise<void> {
		if (updatedService) {
			try {
				await firstValueFrom(
					this.apiService.putData(
						`services/${updatedService.get('id')}`,
						updatedService
					)
				);
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Servicio actualizado exitosamente.',
						isConfirm: false,
					},
				});
				this.getItems();
			} catch (error: any) {
				this.errorMessage =
					'Error al procesar la solicitud: ' + error.message;
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Error',
						message: this.errorMessage,
						isConfirm: false,
					},
				});
			}
		} else {
			console.error(
				'Error al actualizar colaborador:',
				'No se encontró el servicio a actualizar'
			);
		}
	}

	/**
	 * Elimina un servicio
	 *
	 * @param service Servicio a eliminar
	 */
	async deleteService(service: serviceModel) {
		if (service) {
			try {
				await firstValueFrom(
					this.apiService.deleteData(`services/${service.id}`)
				);
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Servicio eliminado exitosamente.',
						isConfirm: false,
					},
				});

				this.getItems();
			} catch (error: any) {
				this.errorMessage =
					'Error al procesar la solicitud: ' + error.message;
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Error',
						message: this.errorMessage,
						isConfirm: false,
					},
				});
			}
		} else {
			console.error(
				'Error al eliminar el servicio:',
				'No se encontró el servicio a eliminar'
			);
		}
	}
}
