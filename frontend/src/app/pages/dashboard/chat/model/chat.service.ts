/**
 * Servicio para manejar los chats
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Chat, Message, Contacts } from './chat.model';
import { ApiService } from '../../../../services/api.service';
import { formatDate, randomImage } from '../../../../utils/Utils';

@Injectable({
	providedIn: 'root',
})
export class ChatService {
	/**
	 * Suscripción de los chats
	 */
	private chatsSubject: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>([]);
	private clientsSubject: BehaviorSubject<Contacts[]> = new BehaviorSubject<Contacts[]>([]);
	private collaboratorsSubject: BehaviorSubject<Contacts[]> = new BehaviorSubject<Contacts[]>([]);

	/**
	 * Suscripción de los contactos
	 */
	private contactsSubject: BehaviorSubject<Contacts[]> = new BehaviorSubject<Contacts[]>([]);

	/**
	 * Usuario logueado
	 */
	user: any;

	/**
	 * Constructor
	 * @param apiService Servicio para realizar peticiones HTTP
	 */
	constructor(private apiService: ApiService) {
		// Obtiene el usuario logueado
		const us = localStorage.getItem('user') || '';
		this.user = JSON.parse(us);
		// Carga los contactos
		this.loadContacts();
	}

	/**
	 * Carga los contactos
	 */
	private loadContacts() {
		this.apiService.getDataE(`chat/contacts`).subscribe({
			next: (data) => {
				const clients = [];
				const collaborators = [];

				for (const val of data) {
					const photo = val.photo ? val.photo : randomImage();
					const contact = { ...val, photo };

					if (val.is_staff === false) clients.push(contact);
					else if (val.is_staff === true)
						collaborators.push(contact);
				}
				this.clientsSubject.next(clients);
				this.collaboratorsSubject.next(collaborators);
			},
			error: (error) => console.error('Fail:', error),
		});
	}

	getClients(): Observable<Contacts[]> {
		return this.clientsSubject.asObservable();
	}

	getCollaborators(): Observable<Contacts[]> {
		return this.collaboratorsSubject.asObservable();
	}
	/**
	 * Obtiene los contactos
	 * @returns Suscripción de los contactos
	 */
	getContacts(): Observable<Contacts[]> {
		// Regresa la suscripción de los contactos
		return this.contactsSubject.asObservable();
	}
	/**
	 * Obtiene un chat por ID
	 * @param id ID del chat
	 * @returns Suscripción del chat
	 */
	getChatById(id: string): Observable<Chat[]> {
		this.apiService.getDataBy(`chat`, id).subscribe({
			next: (data: Message[]) => {
				const chat: Chat = { recipient: id, messages: data };
				this.chatsSubject.next([chat]);
			},
			error: (error) => console.error('Fail:', error),
		});

		return this.chatsSubject.asObservable();
	}

	addMessage(data: any): void {
		this.apiService.postData(`chat`, data).subscribe({
			error: (error) => console.error('Fail:', error),
		});

		setTimeout(() => {
			this.getChatById(data.recipient);
		}, 100);
	}

	/**
	 * Obtiene la fecha de la última conversación
	 * @returns Fecha de la última conversación
	 */
	getLastMessageDate(): string {
		// Obtiene los chats
		let chats = this.chatsSubject.getValue();
		// Obtiene la fecha de la última conversación
		let messageDate: any;
		chats.forEach((chat) => {
			if (chat.messages.length > 0) {
				// Obtiene el último mensaje
				const lastMessage = chat.messages[chat.messages.length - 1];
				// Obtiene la fecha del último mensaje
				messageDate = lastMessage.date;
			}
		});
		// Formatea la fecha
		return formatDate('', 4, messageDate);
	}
}
