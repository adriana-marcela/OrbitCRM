/**
 * Módulo compartido que contiene componentes y utilidades compartidas entre todos los módulos de la aplicación
 */
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Importa el locale para el idioma español
 */
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

/**
 * Importa el módulo de Material Design
 */
import { MaterialModule } from '../material.module';

/**
 * Importa el módulo para cargar archivos con drag y drop
 */
import { NgxDropzoneModule } from 'ngx-dropzone';

/**
 * Importa el módulo para mostrar emojis
 */
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

/**
 * Importa la clase para personalizar el paginator en español
 */
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from '../utils/Paginator';

/**
 * Importa el módulo para mostrar calendarios
 */
import { FullCalendarModule } from '@fullcalendar/angular';

/**
 * Componentes que se encargan de mostrar la barra de navegación lateral
 */
import { AppNavItemComponent } from '../components/sidebar/nav-item/nav-item.component';
import { BrandingComponent } from '../components/sidebar/branding.component';

/**
 * Componentes que se encargan de mostrar modales para agregar/agendar servicios,
 * agregar/editar clientes, agregar/editar colaboradores y agregar/editar servicios
 */
import { AgendaModalComponent } from '../components/modals/agenda-modal/agenda-modal.component';
import { ServiceModalComponent } from '../components/modals/service-modal/service-modal.component';
import { ClientModalComponent } from '../components/modals/client-modal/client-modal.component';
import { AddCollaboratorModalComponent } from '../components/modals/add-collaborator-modal/add-collaborator-modal.component';
import { CollaboratorModalComponent } from '../components/modals/collaborator-modal/collaborator-modal.component';
import { ConfirmationModalComponent } from '../components/modals/confirmation-modal/confirmation-modal.component';
import { RolesModalComponent } from '../components/modals/roles-modal/roles-modal.component';

/**
 * Registra el locale para el idioma español
 */
registerLocaleData(localeEs);

/**
 * Módulo que contiene los componentes y utilidades compartidas
 */
@NgModule({
	declarations: [
		AppNavItemComponent,
		BrandingComponent,
		AgendaModalComponent,
		ServiceModalComponent,
		ClientModalComponent,
		AddCollaboratorModalComponent,
		CollaboratorModalComponent,
		ConfirmationModalComponent,
	],
	imports: [
		CommonModule,
		MaterialModule,
		FullCalendarModule,
		NgxDropzoneModule,
		PickerModule,
		EmojiModule,
	],
	exports: [
		CommonModule,
		MaterialModule,
		FullCalendarModule,
		NgxDropzoneModule,
		PickerModule,
		EmojiModule,
		AppNavItemComponent,
		BrandingComponent,
	],
	providers: [
		{ provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
		{ provide: LOCALE_ID, useValue: 'es' },
	],
})
export class SharedModule {}
