import { ComponentFixture, TestBed } from '@angular/core/testing';

// Importa el componente que se va a probar
import { ClientsComponent } from './clients.component';

// Descripción de las pruebas unitarias del componente ClientsComponent
describe('ClientsComponent', () => {
    // Variable que almacena la instancia del componente
    let component: ClientsComponent;
    // Variable que almacena el fixture del componente
    let fixture: ComponentFixture<ClientsComponent>;

    // Se ejecuta antes de cada prueba, se configura el entorno de prueba
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [ClientsComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(ClientsComponent);
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