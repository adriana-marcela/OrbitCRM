import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../services/nav.service';

/**
 * Componente que representa un item de navegación en el menú lateral
 *
 * Recibe un objeto `NavItem` como parámetro con la información del item,
 * y un número que indica la profundidad del item en el menú.
 */
@Component({
    selector: 'app-nav-item',
    templateUrl: './nav-item.component.html',
    styleUrls: [],
})
export class AppNavItemComponent implements OnChanges {
    /**
     * Item de navegación que se va a mostrar
     */
    @Input() item: NavItem | any;

    /**
     * Profundidad del item en el menú
     */
    @Input() depth: any;
    /**
     * Evento para alternar la navegación móvil
     */
    @Output() toggleMobileNav = new EventEmitter<void>();

    /**
     * Servicio que se encarga de gestionar la navegación
     */
    constructor(public navService: NavService, public router: Router) {
        if (this.depth === undefined) {
            this.depth = 0;
        }
    }

    /**
     * Se llama cuando cambian los parámetros del componente
     */
    ngOnChanges() {
        /**
         * Se suscribe al observable que notifica cuando se cambia la url actual
         * para saber si el item actual está seleccionado
         */
        this.navService.currentUrl.subscribe((url: string) => {
            if (this.item.route && url) {
            }
        });
    }

    /**
     * Se llama cuando se selecciona un item de navegación
     *
     * Si el item no tiene hijos, se navega a la url asociada al item.
     * Si el item tiene hijos, se despliega o se contrae el menú.
     */
    onItemSelected(item: NavItem) {
        if (!item.children || !item.children.length) {
            this.router.navigate([item.route]);
            this.toggleMobileNav.emit()
        }

        /**
         * Se desplaza la página al principio para que el menú quede visible
         */
        document.querySelector('.page-wrapper')?.scroll({
            top: 0,
            left: 0,
        });
    }
}

