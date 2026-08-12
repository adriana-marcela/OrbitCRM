/**
 * Archivo de pruebas para el componente PaymentHistoryComponent
 *
 * Este archivo contiene pruebas unitarias para el componente PaymentHistoryComponent.
 * Las pruebas se realizan utilizando el marco de pruebas de Angular.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryComponent } from './payment-history.component';

/**
 * Suite de pruebas para el componente PaymentHistoryComponent
 *
 * Esta suite de pruebas contiene las pruebas unitarias para el componente PaymentHistoryComponent.
 * Cada prueba se ejecuta en un entorno aislado y se verifica que el componente se haya creado
 * correctamente.
 */
describe('PaymentHistoryComponent', () => {
    let component: PaymentHistoryComponent;
    let fixture: ComponentFixture<PaymentHistoryComponent>;

    /**
     * Se ejecuta antes de cada prueba, se configura el entorno de prueba
     */
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [PaymentHistoryComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(PaymentHistoryComponent);
        // Se obtiene una referencia al componente
        component = fixture.componentInstance;
        // Se renderiza el componente
        fixture.detectChanges();
    });

    /**
     * Verifica que el componente se haya creado correctamente
     */
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});