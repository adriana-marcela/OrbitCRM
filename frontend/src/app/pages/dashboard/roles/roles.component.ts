import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
// import { rolesModel } from './model/roles.model';
import { RolesModalComponent } from '../../../components/modals/roles-modal/roles-modal.component';
import { ConfirmationModalComponent } from '../../../components/modals/confirmation-modal/confirmation-modal.component';
import { ApiService } from '../../../services/api.service';
import { FormBuilder } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { rolModel, permissionModel } from './model/roles.model';

@Component({
	selector: 'app-roles',
	standalone: true,
	imports: [SharedModule],
	templateUrl: './roles.component.html',
})
export class RolesComponent {
	roles: rolModel[] = [];
	permisos: permissionModel[] = [];
	selectedRole: rolModel | null = null;
	securityDisable: boolean = false;
	securityDisableCli: boolean = false;
	actionMap: { [key: string]: string } = {
		add: 'crear',
		change: 'editar',
		delete: 'eliminar',
		view: 'ver',
	};

	clienteSections = [
		{ key: 'General', label: 'General' },
		{ key: 'Tributaria', label: 'Tributaria' },
		{ key: 'ServiciosWordpress', label: 'Servicios y WordPress' },
	];
	colaboradoresSections = [
		{ key: 'General', label: 'Información General y bancaria' },
		{ key: 'Asignacion', label: 'Clientes' },
	];

	// Estructura de permisos
	permissions: {
		[key: string]: any;
	} = {
		Cliente: {
			General: {
				crear: false,
				editar: false,
				eliminar: false,
				ver: false,
			},
			Tributaria: {
				crear: false,
				editar: false,
				eliminar: false,
				ver: false,
			},
			ServiciosWordpress: {
				crear: false,
				editar: false,
				eliminar: false,
				ver: false,
			},
		},
		Colaboradores: {
			General: {
				crear: false,
				editar: false,
				eliminar: false,
				ver: false,
			},
			Asignacion: {
				crear: false,
				editar: false,
				eliminar: false,
				ver: false,
			},
		},
		Servicios: { crear: false, editar: false, eliminar: false, ver: false },
		Pagos: { editar: false, eliminar: false, ver: false },
	};

	constructor(
		private dialog: MatDialog,
		private apiService: ApiService,
		private fb: FormBuilder
	) {
		this.getRoles();
		this.getPermissions();
	}

	loadPermissions(perms: permissionModel[]) {
		perms.forEach((perm) => {
			const code = perm.code;
			const [actionKey, modelKey] = code.split('_');
			const sectionPath = perm.model;
			const action = this.actionMap[actionKey];

			if (!sectionPath || !action) return;
			if (this.permissions[sectionPath]) {
				if (action in this.permissions[sectionPath]) {
					this.permissions[sectionPath][action] = true;
				} else {
					this.permissions[sectionPath]['General'][action] = true;
				}
			} else if (
				sectionPath == 'Tributaria' ||
				sectionPath == 'ServiciosWordpress'
			) {
				this.permissions['Cliente'][sectionPath][action] = true;
			} else if (sectionPath == 'Asignacion') {
				this.permissions['Colaboradores'][sectionPath][action] = true;
			}
		});
	}

	getSelectedPermissionIds(): number[] {
		const selectedIds: number[] = [];

		this.permisos.forEach((perm) => {
			const code = perm.code;
			const [actionKey, modelKey] = code.split('_');
			const sectionPath = perm.model;
			const action = this.actionMap[actionKey];
			if (!sectionPath || !action) return;

			if (this.permissions[sectionPath]) {
				if (this.permissions[sectionPath][action]) {
					selectedIds.push(perm.id);
				} else {
					if (
						this.permissions[sectionPath]['General'] &&
						this.permissions[sectionPath]['General'][action]
					) {
						selectedIds.push(perm.id);
					}
				}
			} else if (
				sectionPath == 'Tributaria' ||
				sectionPath == 'ServiciosWordpress'
			) {
				if (this.permissions['Cliente'][sectionPath][action]) {
					selectedIds.push(perm.id);
				}
			} else if (sectionPath == 'Asignacion') {
				if (this.permissions['Colaboradores'][sectionPath][action]) {
					selectedIds.push(perm.id);
				}
			}
		});
		return selectedIds;
	}

	async getRoles() {
		try {
			const data: rolModel[] = await firstValueFrom(
				this.apiService.getData(`users/admin/roles`)
			);
			this.roles = data;
		} catch (error) {
			console.error('Fail:', error);
		}
	}
	async getPermissions() {
		try {
			const data: permissionModel[] = await firstValueFrom(
				this.apiService.getData(`users/admin/permissions`)
			);
			this.permisos = data;
		} catch (error) {
			console.error('Fail:', error);
		}
	}

	selectRole(role: rolModel): void {
		this.selectedRole = role;
		this.securityDisable = role.name == 'Super Admin' ? true : false;
		this.securityDisableCli =
			role.name == 'Super Admin' || role.name == 'Cliente' ? true : false;
		this.resetPermissions();
		this.loadPermissions(this.selectedRole.permissions);
	}

	async saveRole() {
		const perm = this.getSelectedPermissionIds();
		const role = { ...this.selectedRole, permission_ids: perm };
		try {
			const data = await firstValueFrom(
				this.apiService.putData(`users/admin/roles/${role.id}`, role)
			);

			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Guardado exitoso',
					message: 'El rol ha sido guardado correctamente.',
					isConfirm: false,
				},
			});

			this.getRoles();
		} catch (error: unknown) {
			let errorMessage = 'Error al guardar el rol.';
			if (error instanceof Error) {
				errorMessage += ' ' + error.message;
			}

			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Error',
					message: errorMessage,
					isConfirm: false,
				},
			});
			console.error('Fail:', error);
		}
	}

	delete() {
		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message: '¿Estás seguro de que deseas eliminar este rol?',
				isConfirm: true,
			},
		});
		confirmDialogRef.afterClosed().subscribe(async (result) => {
			if (result) {
				try {
					await firstValueFrom(
						this.apiService.deleteData(
							`users/admin/roles/${this.selectedRole?.id}`
						)
					);
					this.dialog.open(ConfirmationModalComponent, {
						width: '400px',
						data: {
							title: 'Bien hecho',
							message: 'Rol eliminado exitosamente.',
							isConfirm: false,
						},
					});
					this.getRoles();
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

	//Para abrir el modal de crear un rol
	openNewRole(): void {
		const dialogRef = this.dialog.open(RolesModalComponent, {
			// Tamaño del contenedor
			width: '300px',
			height: '30vh',
			// maxWidth: '70vw',
		});

		dialogRef.afterClosed().subscribe(async (nuevoRol) => {
			if (nuevoRol) {
				try {
					const data = await firstValueFrom(
						this.apiService.postData(`users/admin/roles`, nuevoRol)
					);
					this.getRoles();
				} catch (error) {
					console.error('Fail:', error);
				}
			}
		});
	}
	//Para eliminar el checkbox de es colaborador y el boton de elimar para los roles predeterminados
	isDefaultRole(roleName: string | undefined): boolean {
		const defaultRoles = [
			'Admin',
			'Cliente',
			'Cliente Aux',
			'Colaborador',
			'Super Admin',
		];
		return defaultRoles.includes(roleName || '');
	}

	resetPermissions() {
		this.permissions = {
			Cliente: {
				General: {
					crear: false,
					editar: false,
					eliminar: false,
					ver: false,
				},
				Tributaria: {
					crear: false,
					editar: false,
					eliminar: false,
					ver: false,
				},
				ServiciosWordpress: {
					crear: false,
					editar: false,
					eliminar: false,
					ver: false,
				},
			},
			Colaboradores: {
				General: {
					crear: false,
					editar: false,
					eliminar: false,
					ver: false,
				},
				Asignacion: {
					crear: false,
					editar: false,
					eliminar: false,
					ver: false,
				},
			},
			Servicios: {
				crear: false,
				editar: false,
				eliminar: false,
				ver: false,
			},
			Pagos: { editar: false, eliminar: false, ver: false },
		};
	}
}

