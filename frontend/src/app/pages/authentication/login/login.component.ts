import { Component } from '@angular/core';
import {FormBuilder,FormGroup,Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; //Importacion de los estilos de la alerta de error al digitar el login
import { SharedModule } from '../../../shared/shared.module';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; //para las alertas en tarjeta
import { ConfirmationModalComponent } from '../../../components/modals/confirmation-modal/confirmation-modal.component'; //para las alertas en tarjeta

import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-login',
	standalone: true,
	templateUrl: './login.component.html',
	imports: [ReactiveFormsModule, CommonModule, SharedModule], // Importando módulos directamente en el componente standalone
})
export class LoginComponent {
	loginForm: FormGroup;
	recuperarpassword = false;
	loginError: string | null = null; // Variable para almacenar el mensaje de error
	showPassword = false; // Controla si la contraseña se muestra en texto plano o oculta

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private snackBar: MatSnackBar, // Importando módulos directamente en el componente standalone
		private apiService: ApiService,
		private dialog: MatDialog
	) {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required],
			rememberMe: [false],
		});
	}

	exito(): void {
		this.recuperarpassword = true;
	}

	// Alterna entre mostrar la contraseña en texto plano u oculta con puntos
	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	async recover(): Promise<void> {
		const emailControl = this.loginForm.get('email');
		if (!emailControl || emailControl.invalid) {
			emailControl?.markAsTouched();
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Correo inválido',
					message:
						'Por favor ingresa un correo válido para recuperar tu contraseña.',
					isConfirm: false,
				},
			});
			return;
		}

		try {
			await firstValueFrom(
				this.apiService.postData('users/password-reset-request', {
					email: emailControl.value,
				})
			);
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Correo enviado',
					message:
						'Hemos enviado un enlace a tu correo para restablecer tu contraseña.',
					isConfirm: false,
				},
			});
			this.recuperarpassword = false;
		} catch (error) {
			console.error('Error al recuperar contraseña:', error);
			this.dialog.open(ConfirmationModalComponent, {
				width: '400px',
				data: {
					title: 'Error',
					message:
						'Este correo no existe en nuestra base de datos no se pudo enviar el correo de recuperación.',
					isConfirm: false,
				},
			});
		}
	}

	//Funcion para la alerta
	async onSubmit() {
		if (this.loginForm.valid) {
			const formValues = this.loginForm.value;
			const { rememberMe, ...rest } = formValues;

			try {
				const data = await firstValueFrom(
					this.apiService.postData('users/login', rest)
				);
				localStorage.setItem('authToken', data.access);
				localStorage.setItem('refresh_token', data.refresh);
				localStorage.setItem('user', JSON.stringify(data.user));
				this.router.navigate(['/inicio']);
			} catch (error) {
				console.error('Login failed:', error);
				this.dialog.open(ConfirmationModalComponent, {
					width: '400px',
					data: {
						title: 'Verifica las credenciales',
						message:
							'Correo o contraseña incorrectos. Inténtalo de nuevo.',
						isConfirm: false,
					},
				});
			}
		}
	}
}
