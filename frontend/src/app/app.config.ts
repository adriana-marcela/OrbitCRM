/**
 * Configuración de la aplicación.
 *
 * Provee los siguientes providers:
 * - Zone Change Detection: para que Angular detecte los cambios en el DOM
 * - Router: para que la aplicación pueda navegar entre rutas
 * - Animations: para que la aplicación pueda mostrar animaciones
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

/**
 * Rutas de la aplicación
 */
import { appRoutes } from './app.routes';

/**
 * Animaciones asíncronas
 */
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), 
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([authInterceptor])),
        // Detecta cambios en el DOM para que Angular renderice la aplicación
        // Permite navegar entre rutas
        provideRouter(appRoutes),
    ]
};