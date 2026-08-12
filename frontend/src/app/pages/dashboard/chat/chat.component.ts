import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ChatService } from './model/chat.service';
import { Chat, Contacts } from './model/chat.model';

@Component({
	selector: 'app-chat',
	standalone: true,
	imports: [SharedModule],
	templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
	// Información del usuario logueado
	user: any;
	// Historial de chats
	chats: Chat[] = [];
	//Clientes
	clients: Contacts[] = [];
	//Colaboradores
	collaborators: Contacts[] = [];
	// Contacto seleccionado
	selectedContact: Contacts | null = null;
	// Mensaje nuevo
	newMessage: string = '';
	// Mostrar o no el selector de emojis
	showEmojiPicker: boolean = false;
	// Intervalo para actualizar los mensajes cada 7 segundos
	intervaloId: any;
	contactsVisible: boolean = false;

	// Referencia al contenedor de los mensajes
	@ViewChild('messagesContainer') private messagesContainer!: ElementRef;

	constructor(public chatService: ChatService) {}

	ngOnInit(): void {
		// Obtiene el usuario logueado
		const us = localStorage.getItem('user') || '';
		this.user = JSON.parse(us);
		this.loadContacts();
	}
	loadContacts(): void {
		this.chatService.getClients().subscribe({
			next: (contact) => (this.clients = contact),
			error: (error) => console.error('Error fetching chats:', error),
		});
		this.chatService.getCollaborators().subscribe({
			next: (contact) => (this.collaborators = contact),
			error: (error) => console.error('Error fetching chats:', error),
		});
		this.chatService.getContacts();

	}

	toggleContacts() {
		this.contactsVisible = !this.contactsVisible;
	}

	ngAfterViewChecked(): void {
		// Scroll hacia abajo en el contenedor de los mensajes
		this.scrollToBottom();
	}

	ngOnDestroy(): void {
		// Limpia el intervalo para actualizar los mensajes
		clearInterval(this.intervaloId);
	}

	/**
	 * Selecciona un contacto y carga sus chats
	 * @param contact Contacto seleccionado
	 */
	selectContact(contact: Contacts): void {
		this.selectedContact = contact;
		if (this.selectedContact) {
			// Carga los chats del contacto seleccionado
			this.chatService.getChatById(this.selectedContact.email).subscribe({
				next: (chats) => (this.chats = chats),
				error: (error) => console.error('Error fetching chats:', error),
			});
		}
		// Actualiza los mensajes cada 7 segundos
		this.updateMessages();
		// Scroll hacia abajo en el contenedor de los mensajes
		this.scrollToBottom();
	}

	/**
	 * Actualiza los mensajes cada 5 segundos
	 */
	updateMessages(): void {
		// Limpia el intervalo anterior
		clearInterval(this.intervaloId);
		// Crea un nuevo intervalo para actualizar los mensajes cada 5 segundos
		this.intervaloId = setInterval(() => {
			if (this.selectedContact) {
				// Carga los chats del contacto seleccionado
				this.chatService
					.getChatById(this.selectedContact.email)
					.subscribe({
						next: (chats) => (this.chats = chats),
						error: (error) =>
							console.error('Error fetching chats:', error),
					});
			}
		}, 5000);
	}

	/**
	 * Envía un mensaje
	 */
	sendMessage(): void {
		if (this.newMessage.trim() === '' || !this.selectedContact) {
			return;
		}
		// Agrega el mensaje a la lista de chats
		this.chatService.addMessage({
			recipient: this.selectedContact.email,
			text: this.newMessage,
		});

		// Limpia el campo de texto
		this.newMessage = '';
		// Oculta el selector de emojis
		this.showEmojiPicker = false;
		// Scroll hacia abajo en el contenedor de los mensajes
		this.scrollToBottom();
	}

	/**
	 * Agrega un emoji al campo de texto
	 * @param event Evento de selección de emoji
	 */
	addEmoji(event: any) {
		this.newMessage += event.emoji.native; // Agregar el emoji al mensaje
		this.showEmojiPicker = false; // Cerrar el picker después de seleccionar
	}

	/**
	 * Mostrar o no el selector de emojis
	 */
	toggleEmojiPicker() {
		this.showEmojiPicker = !this.showEmojiPicker;
	}
	scrollToBottom(): void {
		try {
			this.messagesContainer.nativeElement.scrollTop =
				this.messagesContainer.nativeElement.scrollHeight;
		} catch (err) {}
	}
}
