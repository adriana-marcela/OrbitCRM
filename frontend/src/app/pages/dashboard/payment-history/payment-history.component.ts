import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService } from '../../../services/api.service';
import { paymentHistoryModel } from './model/payment.model';
import { SharedModule } from '../../../shared/shared.module';
import { firstValueFrom } from 'rxjs';

// Importa MatDialogRef y el componente de diálogo
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../../components/modals/confirmation-modal/confirmation-modal.component';


@Component({
	selector: 'app-payment-history',
	standalone: true,
	imports: [SharedModule],
	templateUrl: './payment-history.component.html',
})
export class PaymentHistoryComponent implements OnInit, AfterViewInit {
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	// Columnas a mostrar en la tabla
	displayedColumns: string[] = [];

	user: any;
	// Fuente de datos para la tabla
	dataSource = new MatTableDataSource<paymentHistoryModel>([]);

	// Control de formulario para el filtro por nombre
	nameFilter = new FormControl('');

	// Filtros activos
	filters = { clients: true, collaborators: true };

	// Estado del dropdown de filtros
	isFilterDropdownOpen = false;

	/**
	 * Variables para el paginador
	 */
	pageSize = 50;
	pageIndex = 0;

	fullData: paymentHistoryModel[] = [];

	constructor(private dialog: MatDialog, private apiService: ApiService) {}

	ngOnInit() {
		const us = localStorage.getItem('user') || '';
		this.user = JSON.parse(us);

		// Columnas visibles por defecto
		this.displayedColumns = [
			'date',
			'client',
			'service',
			'currency',
			'price',
			'is_payed',
		];

		// Agrega la columna 'acciones' solo si es Super Admin
		if (this.user?.rol === 'Super Admin') {
			this.displayedColumns.push('acciones');
		}

		this.fetchFilteredData();
		this.nameFilter.valueChanges.subscribe(() => this.applyLocalFilter());
	}

	// Asigna el ordenamiento y paginación a la fuente de datos
	ngAfterViewInit() {
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;

		this.dataSource.sortingDataAccessor = (item, property) => {
			switch (property) {
				case 'client':
					return item.clientName?.toLowerCase() || '';
				case 'service':
					return item.serviceName?.toLowerCase() || '';
				case 'price':
					return Number(item.price) || 0;
				default:
					return (item as any)[property];
			}
		};
	}

	// Alterna el estado del dropdown de filtros
	toggleFilterDropdown() {
		this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
	}

	onPageChange(event: any): void {
		this.pageIndex = event.pageIndex;
		this.updateDisplayedData();
	}

	onPageSizeChange(value: number): void {
		this.pageSize = value;
		this.updateDisplayedData();
	}

	async fetchFilteredData() {
		const filterType = this.getFilterType();
		const data = await firstValueFrom(
			this.apiService.getDataE(`payment-history/${filterType}`)
		);
		this.fullData = [...data];
		this.paginator.length = this.fullData.length;
		this.paginator.pageSize = this.pageSize;
		this.updateDisplayedData();
	}

	updateDisplayedData(): void {
		const startIndex = this.pageIndex * this.pageSize;
		const endIndex = startIndex + this.pageSize;

		this.dataSource.data = this.fullData.slice(startIndex, endIndex);
	}

	// Aplica el filtro local en la tabla
	applyLocalFilter() {
		const filterValue = this.nameFilter.value?.trim().toLowerCase() || '';
		this.dataSource.filter = filterValue;
	}

	// Determina el tipo de filtro basado en los filtros activos
	getFilterType(): string {
		if (this.filters.clients && this.filters.collaborators) {
			return '';
		}
		if (this.filters.clients) {
			return 'clients';
		}
		if (this.filters.collaborators) {
			return 'collaborators';
		}
		return 'none';
	}

	eliminarFila(row: any) {
		const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
			width: '400px',
			data: {
				title: 'Confirmación',
				message: '¿Estás seguro de que deseas eliminar este registro?',
				isConfirm: true,
			},
		});

		// Manejar la respuesta del diálogo
		confirmDialogRef.afterClosed().subscribe(async (result) => {
			if (result) {
				const data = await firstValueFrom(
					this.apiService.deleteData(`payment-history/${row.id}`)
				);
				this.fetchFilteredData();
			}
		});
	}
}






