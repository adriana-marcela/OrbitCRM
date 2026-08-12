import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-roles-modal',
	standalone: true,
	imports: [
		MatDialogModule,
		FormsModule,
		MatCheckboxModule,
		MatInputModule,
		MatFormFieldModule,
		MatButtonModule,
	],
	templateUrl: './roles-modal.component.html',
})
export class RolesModalComponent {
	nuevoRol = {name: ''};

	constructor(private dialogRef: MatDialogRef<RolesModalComponent>) {}

	guardarRol(): void {
		if (this.nuevoRol.name.trim()) {
			this.dialogRef.close(this.nuevoRol);
		}
	}

	cancelar(): void {
		this.dialogRef.close();
	}
}
