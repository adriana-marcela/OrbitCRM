import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; //para las alertas en tarjeta
import { ConfirmationModalComponent } from '../../../components/modals/confirmation-modal/confirmation-modal.component'; //para las alertas en tarjeta

@Component({
	selector: 'app-recovery',
	standalone: true,
	templateUrl: './recovery.component.html',
	imports: [ReactiveFormsModule, CommonModule],
})
export class RecoveryComponent implements OnInit {
	passwordForm!: FormGroup;
	showPassword: boolean = false; // Control para la visibilidad de "Nueva contraseña"
	showConfirmPassword: boolean = false; // Control para la visibilidad de "Confirmar contraseña"
	uid: string = '';
	token: string = '';

	constructor(
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private apiService: ApiService,
		private router: Router,
		private dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.passwordForm = this.fb.group({
				password: ['', [Validators.required, this.passwordValidator()]],
				confirmPassword: ['', [Validators.required]],
			},{ validators: this.passwordsMatchValidator()}
		);
		this.route.params.subscribe((params) => {
			this.uid = params['uid'];
			this.token = params['token'];
		});
	}
	// Validador personalizado para la contraseña
	passwordValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value || '';
			const hasUppercase = /[A-Z]/.test(value);
			const hasNumber = /\d/.test(value);
			const isValid = hasUppercase && hasNumber;

			return !isValid
				? {
						passwordStrength:
							'La contraseña debe tener al menos una letra mayúscula y un número.',
				  }
				: null;
		};
	}

	passwordsMatchValidator(): ValidatorFn {
		return (group: AbstractControl): ValidationErrors | null => {
			const password = group.get('password')?.value;
			const confirmPassword = group.get('confirmPassword')?.value;

			return password === confirmPassword
				? null
				: { passwordsMismatch: 'Las contraseñas no coinciden.' };
		};
	}

	// Alternar visibilidad de la nueva contraseña
	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	// Alternar visibilidad de la confirmación de contraseña
	toggleConfirmPasswordVisibility(): void {
		this.showConfirmPassword = !this.showConfirmPassword;
	}

	async onSubmit() {
		const payload = {
			uid: this.uid,
			token: this.token,
			new_password: this.passwordForm.value.password,
		};

		try {
			const data = await firstValueFrom(
				this.apiService.postData('users/reset-password', payload)
			);
			const Message = 'Se actualizo la contraseña correctamente';
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Exito',
					message: Message,
					isConfirm: false,
				},
			});
			this.router.navigate(['/login']);
		} catch (error) {
			console.error('Error al actualizar contraseña', error);
		}
	}
}

