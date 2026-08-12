import { Component } from '@angular/core';

/**
 * Componente que se encarga de mostrar el logo de la aplicación en la barra de navegación superior.
 */
@Component({
    selector: 'app-branding',
    /**
     * Template que se utiliza para mostrar el logo de la aplicación.
     */
    template: `
    <a class="branding" href="/">
        <img src="/assets/img/logoCRM.png" class="branding-logo" alt="OrbitCRM"/>
        <span class="branding-name">OrbitCRM</span>
    </a>
  `,
})
export class BrandingComponent {
    /**
     * Constructor del componente. No hace nada en este caso.
     */
    constructor() { }
}