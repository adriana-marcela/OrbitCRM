import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { CustomDateAdapter } from '../../../utils/DateAdapter';
import { DateAdapter } from '@angular/material/core';
import { formatDate, formatTime } from '../../../utils/Utils';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-agenda-modal',
	templateUrl: './agenda-modal.component.html',
	providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
})
export class AgendaModalComponent {
	//Inicializa variable que almacena el nombre de la persona que crea la tarea
	createdByName: string = '';
	corporateName: string = '';
	//Formulario para editar la información del evento.
	eventForm: FormGroup;
	//Arreglo con las horas disponibles para seleccionar.
	hours: string[];
	clients = [{ id: '', corporate_name: '' }];
	collaborators = [{ email: '', fullname: '' }];
	user: any;
	today: Date = new Date();
	/**
	 * Constructor del componente.
	 * @param dialogRef Referencia al diálogo.
	 * @param data Información del evento a editar.
	 * @param fb Inyecta el FormBuilder para crear el formulario.
	 */
	constructor(
		private fb: FormBuilder,
		private dialog: MatDialog,
		private apiService: ApiService,
		private dialogRef: MatDialogRef<AgendaModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		/**
		 * Crea el formulario con los campos title, date, time, description, priority y completed.
		 */
		const us = localStorage.getItem('user') || '';
		this.user = JSON.parse(us);
		// para mostrar la persona que crea la tarea
		this.createdByName = data.created_by_name;
		this.corporateName = data.corporate_name;
		//Para crear los clients
		this.getclients();
		this.getCollaborators();
		this.eventForm = this.fb.group({
			title: [data.title || '', Validators.required],
			date: [data.date || '', Validators.required],
			time: [data.time || '', Validators.required],
			subtext: [data.subtext || ''],
			priority: [data.priority || 'primary', Validators.required],
			completed: [data.completed || false],
			client: [data.assigned || ''], // Este es para asignar el Cliente
			collaborator: [data.assigned_to || ''], // Este es para asignar el Colaborador
		});

		/**
		 * Genera las horas disponibles para seleccionar.
		 */
		this.hours = this.generateTimes();
	}
	//Funcion para traer los clientes
	async getclients() {
		let data = [];
		try {
			data = await firstValueFrom(this.apiService.getData(`clients/simple`));
			this.clients = [...data];
		} catch {
			// No se pudieron cargar los clientes; se deja la lista vacía.
		}
	}
	//Aqui se queman los nombres de la lista de los colaboradores
	async getCollaborators() {
		let data = [];
		try {
			if (this.user.is_staff == true) {
				data = await firstValueFrom(
					this.apiService.getData(`users/simple`)
				);
			} else {
				data = await firstValueFrom(
					this.apiService.getData(`users/simple-cfc`)
				);
			}

			this.collaborators = [...data];
		} catch {
			// No se pudieron cargar los colaboradores; se deja la lista vacía.
		}
	}

	/**
	 * Genera las horas disponibles para seleccionar.
	 * @returns Arreglo con las horas disponibles en formato "HH:MM AM/PM"
	 */
	generateTimes(): string[] {
		const times: string[] = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minutes = 0; minutes < 60; minutes += 15) {
				const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
				const formattedMinutes =
					minutes < 10 ? `0${minutes}` : `${minutes}`;
				times.push(`${formattedHour}:${formattedMinutes}`);
			}
		}
		return times;
	}

	/**
	 * Llama a la función para guardar o actualizar el evento.
	 */
	onSubmit(): void {
		if (this.eventForm.valid) {
			let formattedDate;
			if (typeof this.eventForm.value.date === 'object') {
				formattedDate = formatDate('', 1, this.eventForm.value.date);
			} else {
				formattedDate = formatDate(this.eventForm.value.date, 1);
			}
			const formattedTime = formatTime(this.eventForm.value.time, 1);
			this.eventForm.patchValue({
				date: formattedDate,
				time: formattedTime,
			});

			if (this.data.isEditing) {
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Evento actualizado correctamente.',
						isConfirm: false,
					},
				});
				this.dialogRef.close({
					action: 'edit',
					data: this.eventForm.value,
				});
			} else {
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Bien hecho',
						message: 'Has creado un nuevo evento.',
						isConfirm: false,
					},
				});
				this.dialogRef.close(this.eventForm.value);
			}
		}
	}

	/**
	 * Cierra el modal sin realizar ninguna acción adicional.
	 */
	onCancel(): void {
		this.dialogRef.close();
	}

	/**
	 * Llama a la función para eliminar el evento.
	 */
	onDelete(): void {
		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message: `¿Estás seguro de que deseas eliminar este evento?`,
				isConfirm: true,
			},
		});

		confirmDialogRef.afterClosed().subscribe((result) => {
			if (result) {
				const successDialogRef = this.dialog.open(
					ConfirmationModalComponent,
					{
						width: '400px',
						data: {
							title: 'Bien hecho',
							message: 'Evento eliminado exitosamente.',
							isConfirm: false,
						},
					}
				);

				try {
					this.dialogRef.close({ action: 'delete', data: this.data });
				} catch (error) {
					console.error('Error al eliminar el evento:', error);
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
}
