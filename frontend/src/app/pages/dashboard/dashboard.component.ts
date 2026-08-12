import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';

import { SharedModule } from "../../shared/shared.module";

import { HeaderComponent } from "../../components/header/header.component";
import { SidebarComponent } from '../../components/sidebar/sidebar.component'

/**
 * Tamaños de pantalla
 */
const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';

/**
 * Componente principal de la aplicación
 */
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        HeaderComponent,
        SidebarComponent,
        SharedModule
    ],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    /**
     * Referencia al sidenav
     */
    @ViewChild('leftsidenav')
    public sidenav: MatSidenav | any;

    /**
     * Suscripción a los cambios de la pantalla
     */
    private layoutChangesSubscription = Subscription.EMPTY;

    /**
     * Indica si estamos en una pantalla pequeña (teléfono)
     */
    private isMobileScreen = false;

    /**
     * Indica si el contenido del sidenav tiene un ancho fijo
     */
    private isContentWidthFixed = true;

    /**
     * Indica si el ancho del sidenav es fijo
     */
    private isCollapsedWidthFixed = false;

    /**
     * Referencia al elemento HTML
     */
    private htmlElement!: HTMLHtmlElement;

    /**
     * Cierra el sidenav
     */
    onCloseSidenav() {
        if (this.sidenav) {
            this.sidenav.close();
        }
    }

    /**
     * Comprueba si estamos en una pantalla pequeña
     */
    get isOver(): boolean {
        return this.isMobileScreen;
    }

    /**
     * Constructor del componente
     * @param breakpointObserver observable que se suscribe a los cambios de la pantalla
     */
    constructor(private breakpointObserver: BreakpointObserver) {
        this.htmlElement = document.querySelector('html')!;
        this.layoutChangesSubscription = this.breakpointObserver
            .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW])
            .subscribe((state) => {
                // SidenavOpened must be reset true when layout changes

                this.isMobileScreen = state.breakpoints[MOBILE_VIEW];

                this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
            });
    }

    /**
     * Inicializa el componente
     */
    ngOnInit(): void { }

    /**
     * Destruye el componente
     */
    ngOnDestroy() {
        this.layoutChangesSubscription.unsubscribe();
    }

    /**
     * Cambia el ancho del sidenav
     */
    toggleCollapsed() {
        this.isContentWidthFixed = false;
    }

    /**
     * Se llama cuando el sidenav se cierra
     */
    onSidenavClosedStart() {
        this.isContentWidthFixed = false;
    }

    /**
     * Se llama cuando el sidenav cambia de estado
     * @param isOpened indica si el sidenav está abierto o cerrado
     */
    onSidenavOpenedChange(isOpened: boolean) {
        this.isCollapsedWidthFixed = !this.isOver;
    }
}


