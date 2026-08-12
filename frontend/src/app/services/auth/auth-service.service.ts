/**
 * Servicio de autenticación.
 * 
 * Este servicio proporciona métodos para verificar si el usuario
 * está autenticado y para cerrar la sesión.
 */
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private apiService: ApiService) {}
    /**
     * Verifica si el usuario está autenticado.
     * 
     * @returns True si el usuario está autenticado, false en caso contrario.
     */
    isLoggedIn(): boolean {
        const token = localStorage.getItem('authToken');
        return token != null;
    }

    /**
     * Cierra la sesión del usuario.
     * 
     * Elimina el token de autenticación y el usuario almacenados en el localStorage.
     */
    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }
    refreshToken() {
        return this.apiService.refreshToken();
    }

    isTokenExpiringSoon(token: string, marginSeconds = 300): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            return exp - now < marginSeconds;
        } catch (e) {
            return true; // Si falla al decodificar, asumimos que está vencido
        }
    }
}