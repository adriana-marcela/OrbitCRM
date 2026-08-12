import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';

/**
 * Servicio que se encarga de observar los cambios de ruta y notificar
 * a los subscriptores cual es la ruta actual.
 */
@Injectable({ providedIn: 'root' })
export class NavService {

    /**
     * Observable que se encarga de notificar a los subscriptores
     * la ruta actual.
     */
    public currentUrl = new BehaviorSubject<any>(undefined);

    constructor(private router: Router) {
        /**
         * Suscripción a los eventos de router. Cuando se produce
         * un cambio de ruta (NavigationEnd), se notifica a los
         * subscriptores la ruta actual.
         */
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.currentUrl.next(event.urlAfterRedirects);
            }
        });
    }
}

