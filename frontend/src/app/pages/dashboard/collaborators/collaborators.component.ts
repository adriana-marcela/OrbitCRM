import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FormControl } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { collaboratorModel, simpleCollaboratorModel } from './model/collaborator.model';

import { CollaboratorModalComponent } from '../../../components/modals/collaborator-modal/collaborator-modal.component';
import { AddCollaboratorModalComponent } from '../../../components/modals/add-collaborator-modal/add-collaborator-modal.component';
import { rolModel } from '../roles/model/roles.model';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { randomImage } from '../../../utils/Utils';

@Component({
    selector: 'app-collaborators',
    standalone: true,
    imports: [
        SharedModule
    ],
    templateUrl: './collaborators.component.html'
})
export class CollaboratorsComponent {
    // Array para almacenar los colaboradores
    collaboratorItems: simpleCollaboratorModel[] = [];
	filteredCollaborators: simpleCollaboratorModel[] = [];
    viewMode: 'grid' | 'list' = 'grid';
    user:any;
    /**
     * Variables para el paginador
     */
    pageSize = 100;
    pageIndex = 0;

	// Agregamos el FormControl para el filtro
	nameFilter = new FormControl('');

    constructor(private dialog: MatDialog, private apiService: ApiService) { }

    ngOnInit(): void {
        // Carga los colaboradores al inicializar el componente
        this.getColaborators();
        const us = localStorage.getItem('user') || "";
        this.user = JSON.parse(us);
		this.nameFilter.valueChanges.subscribe((value) => {
			this.filterCollaborators(value || '');
		});
    }

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
	filterCollaborators(value: string) {
		if (value) {
			this.filteredCollaborators = this.collaboratorItems.filter(collaborator =>
				collaborator.fullname.toLowerCase().includes(value.toLowerCase()) ||
				collaborator.rol?.toLowerCase().includes(value.toLowerCase()) ||
				collaborator.email.toLowerCase().includes(value.toLowerCase())
			);
		} else {
			this.filteredCollaborators = [...this.collaboratorItems];
		}
	}

    // Obtiene los colaboradores desde la API
    async getColaborators() {
        try {
			const data: simpleCollaboratorModel[] = await firstValueFrom(
				this.apiService.getData(`users/simple`)
			);
			let colab = [];
			for (var val of data) {
				// Asigna una imagen aleatoria si no se proporciona una
				let foto =
					val.photo != ''
						? val.photo != null
							? val.photo
							: randomImage()
						: randomImage();
				const newColab = {
					...val,
					photo: foto,
				};
				colab.push(newColab);
			}
			// Actualiza el array de colaboradores
			this.collaboratorItems = [...colab];
			this.filteredCollaborators = [...data];
		} catch (error) {
            console.error('Fail:', error);
        }
    }

    async getRoles(){
        try {
            const data = await firstValueFrom(
                this.apiService.getDataE(`users/admin/roles/?is_staff=true`)
            );
            return data;
        } catch (error) {
            console.error('Fail:', error);
            return undefined;
        }
    }

    async getCollaborator(colab:simpleCollaboratorModel):Promise<collaboratorModel | undefined>{
        try {
			const data: collaboratorModel = await firstValueFrom(
				this.apiService.getData(`users/${colab.email}`)
			);
            return data;
		} catch (error) {
            console.error('Fail:', error);
            return undefined;
        }
    }
    // Abre el modal para editar un colaborador existente
    async openCollaboratorModal(sCollaborator: simpleCollaboratorModel) {
        if(this.user.is_staff){
            const collaborator = await this.getCollaborator(sCollaborator);
            const rols = await this.getRoles();
            const dialogRef = this.dialog.open(CollaboratorModalComponent, {
                // Tamaño del contenedor
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                // width: '100%',
                // height: '660px',
                data: { collaborator: collaborator, roles: rols },
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result?.success) {
                    this.getColaborators();
                }
            });
        }
    }

    // Abre el modal para agregar un nuevo colaborador
    async openAddCollaboratorModal() {
        const rols = await this.getRoles();
        const dialogRef = this.dialog.open(AddCollaboratorModalComponent, {
			// Tamaño del contenedor
			width: '100vw',
			height: '100vh',
			maxWidth: '100vw',
			data: { collaborator: {}, roles: rols },
		});

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.success) {
                this.getColaborators();
            }
        });
    }
}
