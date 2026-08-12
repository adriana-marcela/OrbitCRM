// Importar las dependencias necesarias para los test
import { ComponentFixture, TestBed } from '@angular/core/testing';

// Importar el componente a probar
import { ClientModalComponent } from './client-modal.component';

// Crear el bloque de pruebas para el componente ClientModalComponent
describe('ClientModalComponent', () => {
    // Variables para almacenar el componente y el fixture
    let component: ClientModalComponent;
    let fixture: ComponentFixture<ClientModalComponent>;

    // Función que se ejecuta antes de cada prueba
    beforeEach(async () => {
        // Configurar el entorno de pruebas
        await TestBed.configureTestingModule({
            // Importar el componente a probar
            imports: [ClientModalComponent]
        })
            // Compilar el entorno de pruebas
            .compileComponents();

        // Crear el fixture del componente
        fixture = TestBed.createComponent(ClientModalComponent);
        // Asignar el componente a la variable de instancia
        component = fixture.componentInstance;
        // Detectar los cambios en el componente
        fixture.detectChanges();
    });

    // Caso de prueba: verificar que el componente se haya creado correctamente
    it('should create', () => {
        // Verificar que el componente se haya creado correctamente
        expect(component).toBeTruthy();
    });
});