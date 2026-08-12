/**
 * Módulo que contiene las rutas de la aplicación
 *
 * Contiene las rutas que se utilizarán en la aplicación. La ruta
 * vacía se redirige a la ruta del dashboard, y la ruta '**' se
 * redirige a la ruta del login. Las rutas del login y del registro
 * se definen aquí también. La ruta del dashboard se define con
 * rutas hijas.
 */
import { Routes } from '@angular/router';

// Rutas de autenticación
import { LoginComponent } from './pages/authentication/login/login.component';
import { PortalComponent } from './pages/authentication/portal/portal.component';

// Rutas del dashboard
import { DashboardComponent } from './pages/dashboard/dashboard.component'; // Importa directamente el componente standalone
import { ProfileComponent } from './pages/dashboard/profile/profile.component';
import { HomeComponent } from './pages/dashboard/home/home.component';
import { ClientsComponent } from './pages/dashboard/clients/clients.component';
import { ServicesComponent } from './pages/dashboard/services/services.component';
import { ChatComponent } from './pages/dashboard/chat/chat.component';
import { PaymentHistoryComponent } from './pages/dashboard/payment-history/payment-history.component';
import { CollaboratorsComponent } from './pages/dashboard/collaborators/collaborators.component';
import { RolesComponent } from './pages/dashboard/roles/roles.component'; //Para roles

// Ruta de Autenticación
import {AuthGuard} from './services/auth/auth-guard.service';
import { RecoveryComponent } from './pages/authentication/recovery/recovery.component';

export const appRoutes: Routes = [
	{ path: '', redirectTo: 'portal', pathMatch: 'full' }, // Ruta vacía

	// { path: '**', redirectTo: 'login' }, // Ruta '**' se redirige a la ruta del login

	{ path: 'login', component: LoginComponent }, // Ruta del login
	{ path: 'portal', component: PortalComponent }, // Ruta del portal
	{ path: 'recuperar/:uid/:token', component: RecoveryComponent }, //Ruta del recuperar contraseña

	{
		path: '',
		component: DashboardComponent,
		children: [
			{
				path: 'perfil',
				component: ProfileComponent,
				data: { Title: 'Perfil' },
				canActivate: [AuthGuard],
			}, // Ruta para colaboradores
			{
				path: 'inicio',
				component: HomeComponent,
				data: { Title: 'Inicio' },
				canActivate: [AuthGuard],
			}, // Ruta para inicio
			{
				path: 'clientes',
				component: ClientsComponent,
				data: { Title: 'Clientes' },
				canActivate: [AuthGuard],
			}, // Ruta para clientes
			{
				path: 'servicios',
				component: ServicesComponent,
				data: { Title: 'Servicios' },
				canActivate: [AuthGuard],
			}, // Ruta para servicios
			{
				path: 'chat',
				component: ChatComponent,
				data: { Title: 'Chat' },
				canActivate: [AuthGuard],
			}, // Ruta para chat
			{
				path: 'pagos',
				component: PaymentHistoryComponent,
				data: { Title: 'Historial de Pagos' },
				canActivate: [AuthGuard],
			}, // Ruta para el historial de pagos
			{
				path: 'colaboradores',
				component: CollaboratorsComponent,
				data: { Title: 'Colaboradores' },
				canActivate: [AuthGuard],
			}, // Ruta para colaboradores
			{
				path: 'roles',
				component: RolesComponent,
				data: { Title: 'Roles' },
				canActivate: [AuthGuard],
			}, //Ruta para roles
		],
	},
];
