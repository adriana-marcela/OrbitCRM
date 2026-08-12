/**
 * Servicio que se encarga de autenticar a los usuarios en la aplicación.
 * 
 * Este servicio se encarga de verificar si el usuario está autenticado
 * antes de permitirle acceder a una ruta.
 * 
 * @export
 * @class AuthGuard
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth-service.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    /**
     * Constructor del servicio.
     * 
     * @param {AuthService} authService Servicio que se encarga de autenticar a los usuarios.
     * @param {Router} router Servicio que se encarga de navegar entre rutas.
     * @memberof AuthGuard
     */
    constructor(private authService: AuthService, private router: Router) { }

    /**
     * Verifica si el usuario está autenticado.
     * 
     * @returns {boolean} True si el usuario está autenticado, false en caso contrario.
     * @memberof AuthGuard
     */
    canActivate(): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}