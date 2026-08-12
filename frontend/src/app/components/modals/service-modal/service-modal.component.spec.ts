import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceModalComponent } from './service-modal.component';

/**
 * Descripción de las pruebas del componente ServiceModalComponent
 */
describe('ServiceModalComponent', () => {
    let component: ServiceModalComponent;
    let fixture: ComponentFixture<ServiceModalComponent>;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ServiceModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ServiceModalComponent);
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