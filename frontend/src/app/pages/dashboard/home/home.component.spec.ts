import { ComponentFixture, TestBed } from '@angular/core/testing';

/**
 * Pruebas unitarias del componente HomeComponent
 */
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    // Antes de cada prueba, se configura el entorno de prueba
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [HomeComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(HomeComponent);
        // Se obtiene una referencia al componente
        component = fixture.componentInstance;
        // Se renderiza el componente
        fixture.detectChanges();
    });

    // Se verifica que el componente se haya creado correctamente
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});