import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';

/**
 * Pruebas unitarias del componente ChatComponent
 *
 * Verifica que el componente se haya creado correctamente
 */
describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    /**
     * Antes de cada prueba, se configura el entorno de prueba
     */
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [ChatComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(ChatComponent);
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