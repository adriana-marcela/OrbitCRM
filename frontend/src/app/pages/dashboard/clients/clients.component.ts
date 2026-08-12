/**
 * Componente principal de la página de clientes
 *
 * Muestra una lista de todos los clientes y permite agregar, editar y eliminarlos
 */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FormControl } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { clientModel, simpleClientModel } from './model/client.model';

import { ClientModalComponent } from '../../../components/modals/client-modal/client-modal.component';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { randomImage } from '../../../utils/Utils';

@Component({
    selector: 'app-clients',
    standalone: true,
    imports: [
        SharedModule
    ],
    templateUrl: './clients.component.html'
})
export class ClientsComponent {
    /**
     * Lista de clientes
     */
    clientItems: simpleClientModel[] = [];
	filteredClients: simpleClientModel[] = [];
    user: any;
    viewMode: 'grid' | 'list' = 'grid';

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
     * @param dialog Servicio para abrir los modales
     * @param apiService Servicio para realizar las peticiones HTTP
     */
    constructor(private dialog: MatDialog, private apiService: ApiService) { }

    toggleView(mode: 'grid' | 'list') {
        this.viewMode = mode;
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

	// Método para filtrar los colaboradores según el texto ingresado en el filtro
	filterClients(value: string) {
		if (value) {
			this.filteredClients = this.clientItems.filter(clients =>
				clients.fullname.toLowerCase().includes(value.toLowerCase()) ||
				clients.email.toLowerCase().includes(value.toLowerCase())
			);
		} else {
			this.filteredClients = [...this.clientItems];
		}
	}

    /**
     * Obtiene la lista de clientes
     */
    async getClients() {
        let target = this.user?.rol === 'Colaborador' ? `users/admin/assign/?user=${this.user.email}` :`clients/simple`;
        try {
			const data: simpleClientModel[] = await firstValueFrom(
				this.apiService.getData(`clients/simple`)
			);

			let cli = [];
			for (var val of data) {
				let foto =
					val.photo != ''
						? val.photo != null
							? val.photo
							: randomImage()
						: randomImage();
				const newClient = {
					...val,
					photo: foto,
				};
				cli.push(newClient);
			}
			this.clientItems = cli;
			this.filteredClients = cli;
		} catch (error) {
            console.error('Fail:', error);
        }
    }

    async getRoles(){
        try {
            const data = await firstValueFrom(
                this.apiService.getDataE(`users/admin/roles/?is_staff=false`)
            );
            return data;
        } catch (error) {
            console.error('Fail:', error);
            return undefined;
        }
    }

    async getClient(cli:simpleClientModel):Promise<clientModel | undefined>{
        try {
            const data: clientModel = await firstValueFrom(
                this.apiService.getData(`clients/${cli.id}`)
            );
            return data;
        } catch (error) {
            console.error('Fail:', error);
            return undefined;
        }
    }

    /**
     * Abre el modal para agregar o editar un cliente
     *
     * @param client Cliente a editar (opcional)
     */
	async openClientModal(cli: simpleClientModel) {
		// Evita que el rol "Colaborador" abra el modal
		if (this.user?.rol === 'Colaborador') {
			return; // No hace nada
		}
		const client = await this.getClient(cli);
		const rols = await this.getRoles();
		const dialogRef = this.dialog.open(ClientModalComponent, {
			// Tamaño del contenedor
			width: '100vw',
			height: '100vh',
			maxWidth: '100vw',
			data: {
				client,
				action: 'update',
				roles: rols,
			},
		});

		dialogRef.afterClosed().subscribe(async (result) => {
			if (result.origin == 'tributario') {
				try {
					const data = await firstValueFrom(
						this.apiService.postData(
							`clients/${result.client_id}/tributary/all`,
							result.tributaryFormData
						)
					);
				} catch (error) {
					console.error('Fail:', error);
				}
			} else {
				const updatedClient = result.clientFormData;
				if (updatedClient) {
					try {
						const data = await firstValueFrom(
							this.apiService.putData(
								`clients/${updatedClient.get('id')}`,
								updatedClient
							)
						);
					} catch (error) {
						console.error('Fail:', error);
					}
				}
			}
			this.getClients();
		});
	}

    /**
     * Abre el modal para agregar un nuevo cliente
     */
    async openAddClientModal() {
        const rols = await this.getRoles();
        const dialogRef = this.dialog.open(ClientModalComponent, {
			// Tamaño del contenedor
			width: '100vw',
			height: '100vh',
			maxWidth: '100vw',
			data: {
				client: [],
				action: 'create',
                roles: rols,
			},
		});

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    const createdClient = await firstValueFrom(
                        this.apiService.postData(`clients`, result.clientFormData)
                    );
                    const clientId = createdClient.id;
                    // Crear tributarias usando el ID obtenido
                    const tributaryResponse = await firstValueFrom(
                        this.apiService.postData(`clients/${clientId}/tributary/all`, result.tributaryFormData)
                    );
                    this.getClients();

                } catch (error) {
                    console.error('Error al crear cliente o tributarias:', error);
                }
            }
        });
    }

    /**
     * Inicializa el componente
     */
    ngOnInit(): void {
        const us = localStorage.getItem('user') || "";
        this.user = JSON.parse(us);
		this.nameFilter.valueChanges.subscribe((value) => {
			this.filterClients(value || '');
		});
        this.getClients();
    }
}
