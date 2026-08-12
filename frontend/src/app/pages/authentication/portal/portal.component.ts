import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
	selector: 'app-portal',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatIconModule,
		MatGridListModule,
		MatButtonModule,
	],
	templateUrl: './portal.component.html',
})
export class PortalComponent implements AfterViewInit {
	@ViewChild('carousel', { static: false })
	carousel!: ElementRef<HTMLDivElement>;
	constructor(private router: Router) {}

	irALogin() {
		this.router.navigate(['/login']);
	}
	integraciones = [
		{
			icon: 'person_add',
			title: 'Clientes',
			image: 'assets/img/Clientes.png',
			description: 'Administra tus clientes',
		},
		{
			icon: 'group',
			title: 'Colaboradores',
			image: 'assets/img/Colaboradores.png',
			description: 'Interactúa con tu equipo de trabajo.',
		},
		{
			icon: 'engineering',
			title: 'Servicios',
			image: 'assets/img/Servicios.png',
			description: 'Organiza y presenta tus servicios.',
		},
		{
			icon: 'payments',
			title: 'Pagos',
			image: 'assets/img/Pagos.png',
			description: 'Gestiona cuentas por cobrar.',
		},
		{
			icon: 'chat',
			title: 'Chat',
			image: 'assets/img/Chat.png',
			description: 'Comunicación directa.',
		},
		{
			icon: 'calendar_today',
			title: 'Tareas y actividades',
			image: 'assets/img/Inicio.png',
			description: 'Asignación por cliente y colaborador.',
		},
	];

	ngAfterViewInit(): void {
		this.startAutoScroll();
	}

	scrollLeft(): void {
		this.carousel.nativeElement.scrollBy({
			left: -320,
			behavior: 'smooth',
		});
	}

	scrollRight(): void {
		this.carousel.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
	}

	startAutoScroll(): void {
		setInterval(() => {
			this.scrollRight();
		}, 4000); // cada 4 segundos
	}
}

