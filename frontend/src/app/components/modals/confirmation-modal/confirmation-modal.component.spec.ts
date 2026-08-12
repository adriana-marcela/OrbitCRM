/**
 * Archivo de pruebas para el componente ConfirmationModalComponent
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

/**
 * Importa el componente a probar
 */
import { ConfirmationModalComponent } from './confirmation-modal.component';

/**
 * Descripción de las pruebas para el componente ConfirmationModalComponent
 */
describe('ConfirmationModalComponent', () => {
    let component: ConfirmationModalComponent;
    let fixture: ComponentFixture<ConfirmationModalComponent>;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmationModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ConfirmationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /**
     * Verifica que el componente se haya creado correctamente
     */
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});