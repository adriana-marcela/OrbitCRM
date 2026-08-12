/**
 * Componente principal de la página de inicio
 */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { agendaModel } from './model/agenda.model';
import { formatDate, formatTime } from '../../../utils/Utils';
import { AgendaModalComponent } from '../../../components/modals/agenda-modal/agenda-modal.component';

import { SharedModule } from '../../../shared/shared.module';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [SharedModule],
	templateUrl: './home.component.html',
})
export class HomeComponent {
	/**
	 * Opciones de configuración del calendario
	 */
	calendarOptions: any;

	/**
	 * Lista de eventos del calendario
	 */
	agendaItems: agendaModel[] = [];
	filteredAgendaItems: agendaModel[] = [];
	notifications: any[] = [];
	/**
	 * Colores de prioridad
	 */
	private priorityColors: { [key: string]: string } = {
		primary: '#0085db',
		warning: '#FFA600',
		success: '#4bd08b',
		danger: '#fb977d',
	};

	/**
	 * Constructor del componente
	 * @param dialog Servicio de diálogos
	 * @param apiService Servicio de API
	 */
	constructor(public dialog: MatDialog, private apiService: ApiService) {
		this.calendarOptions = {
			plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
			initialView: 'dayGridMonth',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,timeGridWeek,timeGridDay',
			},
			locale: 'es',
			buttonText: {
				today: 'Hoy',
				month: 'Mes',
				week: 'Semana',
				day: 'Día',
			},
			events: [],
			dateClick: this.handleDateClick.bind(this),
			eventClick: this.handleEventClick.bind(this),
		};
	}

	/**
	 * Obtiene los eventos del calendario
	 */
	async getItems() {
		try {
			const data = await firstValueFrom(
				this.apiService.getData(`agenda`)
			);
			let ev = [];
			let agItems = [];
			for (var val of data) {
				// Obtener iniciales del creador
				let initials = '';
				if (val.assigned_to_name) {
					const nameParts = val.assigned_to_name.trim().split(' '); // Aqui se cambia el nombre cuando se cree en el back
					for (let part of nameParts) {
						if (part.length > 0) {
							initials += part[0].toUpperCase();
						}
					}
					// Aqui se separa por puntos
					initials = initials.split('').join('.');
				}

				// Crear el título con las iniciales
				const fullTitle = val.completed
					? '¡Tarea completa!'
					: (val.corporate_name || val.title) +
					  (initials ? ` (${initials})` : '');

				const newEvent = {
					id: val.id,
					title: fullTitle,
					real_title: val.title,
					date: formatDate(val.date, 2),
					time: formatTime(val.time, 3),
					assigned_to: val.assigned_to,
					created_by_name: val.created_by_name,
					corporate_name: val.corporate_name,
					subtext: val.subtext,
					priority: val.priority,
					completed: val.completed,
					backgroundColor:
						this.priorityColors[val.priority] || '#000',
					borderColor: this.priorityColors[val.priority] || '#000',
				};
				const item: agendaModel = {
					...val,
					time: formatTime(val.time),
				};
				agItems.push(item);
				ev.push(newEvent);
			}


			this.calendarOptions = {
				...this.calendarOptions,
				events: ev,
				eventOrder: 'time',
			};
			this.agendaItems = agItems;

			this.filteredAgendaItems = this.getTodayEvents();
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	// Obtiene las notificaciones
	async getNotifications() {
		try {
			const res = await firstValueFrom(
				this.apiService.getData(`notifications`)
			);
			this.notifications = res.results.map((n: any) => ({
				...n,
				date: this.parseDate(n.date), // aquí parseas la fecha
				message: n.message.replace(/\n/g, '<br>'),
			}));
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	// para modificar la fecha y que no salga error en consola
	parseDate(dateStr: string): Date {
		// Espera formato "dd/MM/yyyy"
		const [day, month, year] = dateStr.split('/');
		return new Date(+year, +month - 1, +day); // el mes empieza en 0 (enero)
	}

	/**
	 * Filtra los eventos para mostrar solo los de la fecha actual.
	 * @returns Lista de eventos filtrados.
	 */
	getTodayEvents(): agendaModel[] {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return this.agendaItems.filter((event) => {
			const eventDateStr = formatDate(event.date, 2);
			const eventDate = formatDate(eventDateStr, 3);

			eventDate.setHours(0, 0, 0, 0);

			return eventDate.getTime() === today.getTime();
		});
	}

	/**
	 * Abre el diálogo para agregar un nuevo evento
	 */
	addEvent() {
		const dialogRef = this.dialog.open(AgendaModalComponent, {
			width: '500px',
			data: { date: null, isEditing: false },
		});

		dialogRef.afterClosed().subscribe(async (result) => {
			if (result && !result.isEditing) {
				this.saveEvent(result);
			}
		});
	}

	/**
	 * Maneja el click en una fecha del calendario
	 * @param arg Información de la fecha seleccionada
	 */
	handleDateClick(arg: any) {
		const dialogRef = this.dialog.open(AgendaModalComponent, {
			width: '500px',
			data: { date: arg.dateStr + 'T00:00:00', isEditing: false },
		});

		dialogRef.afterClosed().subscribe(async (result) => {
			if (result && !result.isEditing) {
				this.saveEvent(result);
			} else {
				this.updateEvent(result);
			}
		});
	}

	/**
	 * Maneja el click en un evento del calendario
	 * @param arg Información del evento seleccionado
	 */
	handleEventClick(arg: any) {
		const dialogRef = this.dialog.open(AgendaModalComponent, {
			width: '500px',
			data: {
				...arg.event.extendedProps,
				title: arg.event.extendedProps.real_title,
				date: arg.event.startStr + 'T00:00:00',
				id: arg.event.id,
				isEditing: true,
				assigned_to: arg.event.extendedProps.assigned_to,
				assigned: arg.event.extendedProps.assigned_client,
				created_by_name: arg.event.extendedProps.created_by_name,
				corporate_name: arg.event.extendedProps.corporate_name,
			},
		});

		dialogRef.afterClosed().subscribe(async (result) => {
			if (result?.action === 'edit') {
				this.updateEvent(arg.event, result.data);
			} else if (result?.action === 'delete') {
				this.deleteEvent(arg.event);
			}
		});
	}

	/**
	 * Guarda un nuevo evento
	 * @param result Información del nuevo evento
	 */
	async saveEvent(result: any) {
		const newEvent = {
			title: result.title,
			date: formatDate(result.date, 2),
			time: formatTime(result.time, 2),
			subtext: result.subtext,
			priority: result.priority,
			completed: result.completed,
			backgroundColor: this.priorityColors[result.priority] || '#000',
			borderColor: this.priorityColors[result.priority] || '#000',
		};

		this.calendarOptions = {
			...this.calendarOptions,
			events: [...this.calendarOptions.events, newEvent],
		};

		const newAgendaItem = {
			title: result.title,
			time: result.time,
			date: result.date,
			subtext: result.subtext,
			priority: result.priority,
			completed: result.completed,
			assigned_client: result.client, //Para cliente
			assigned_to: result.collaborator,
		};
		try {
			const data = await firstValueFrom(
				this.apiService.postData(`agenda`, newAgendaItem)
			);
		} catch (error) {
			console.error('Fail:', error);
		}
		this.getItems();
	}

	/**
	 * Actualiza un evento
	 * @param updatedEvent Información del evento actualizado
	 * @param data datos del evento actualizado
	 */
	async updateEvent(updatedEvent: any, data?: any) {
		if (data) {
			try {
				const updatedEv = {
					...data,
					date: data.date,
					time: formatTime(data.time),
					assigned_client: data.client,
					assigned_to: data.collaborator,
				};
				const res = await firstValueFrom(
					this.apiService.putData(
						`agenda/${updatedEvent.id}`,
						updatedEv
					)
				);
				this.getItems();
			} catch (error) {
				console.error('Fail:', error);
			}
		}
	}

	/**
	 * Elimina un evento
	 * @param eventToDelete Información del evento a eliminar
	 */
	async deleteEvent(eventToDelete: any) {
		this.agendaItems = this.agendaItems.filter(
			(evt) => evt.id !== parseInt(eventToDelete.id)
		);
		this.calendarOptions.events = this.calendarOptions.events.filter(
			(evt: { id: number }) => evt.id !== parseInt(eventToDelete.id)
		);
		try {
			const res = await firstValueFrom(
				this.apiService.deleteData(`agenda/${eventToDelete.id}`)
			);
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	/**
	 * Se llama al iniciar el componente
	 */
	ngOnInit(): void {
		this.getItems();
		this.getNotifications();
	}
}
