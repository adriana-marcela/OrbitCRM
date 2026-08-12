/**
 * Componente que representa el menú lateral de la aplicación
 *
 * Contiene un array de objetos que representan los items del menú
 * y un servicio que se encarga de gestionar la navegación.
 */
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { navItems } from "./sidebar-data";
import { NavService } from '../../services/nav.service';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { SharedModule } from "../../shared/shared.module";

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, SharedModule, NgScrollbarModule],
    templateUrl: './sidebar.component.html'
})

export class SidebarComponent implements OnInit {
    /**
     * Array de objetos que representan los items del menú lateral
     */
    navItems = navItems;

    @Output() closeSidenav = new EventEmitter<void>();

    /**
    * Considera móvil si el ancho es menor a 768px
    */
    isMobile(): boolean {
        return window.innerWidth < 768;
    }

    /**
     * Emitir el evento solo si es móvil
     */
    handleNavItemClick() {
        if (this.isMobile()) {
            this.closeSidenav.emit();
        }
    }

    /**
     * Servicio que se encarga de gestionar la navegación
     */
    constructor(public navService: NavService) { }

    ngOnInit(): void { 
        const us = localStorage.getItem('user') || "";
        const user = JSON.parse(us);
        if(user.is_staff){
            this.navItems.push({
                displayName: 'Pagos',
                iconName: 'payments',
                route: '/pagos',
	        })
        }
        if(user.rol == "Super Admin"){
            this.navItems.push({
                displayName: 'Roles',
                iconName: 'supervisor_account',
                route: '/roles',
	        })
        }
    }
}

