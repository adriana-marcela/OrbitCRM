import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesComponent } from './services.component';

// Descripción de las pruebas unitarias del componente ServicesComponent
describe('ServicesComponent', () => {
    // Variable que almacena la instancia del componente
    let component: ServicesComponent;
    // Variable que almacena el fixture del componente
    let fixture: ComponentFixture<ServicesComponent>;

    // Se ejecuta antes de cada prueba, se configura el entorno de prueba
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [ServicesComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(ServicesComponent);
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