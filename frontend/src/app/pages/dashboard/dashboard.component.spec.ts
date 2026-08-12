import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';

/**
 * Pruebas unitarias del componente DashboardComponent
 *
 * Verifica que el componente se haya creado correctamente
 */
describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    // Antes de cada prueba, se configura el entorno de prueba
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [DashboardComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(DashboardComponent);
        // Se obtiene una referencia al componente
        component = fixture.componentInstance;
        // Se renderiza el componente
        fixture.detectChanges();
    });

    // Verifica que el componente se haya creado correctamente
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});