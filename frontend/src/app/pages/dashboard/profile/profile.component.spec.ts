import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';

// Descripción de las pruebas unitarias del componente ProfileComponent
describe('ProfileComponent', () => {
    // Variable que almacena la instancia del componente
    let component: ProfileComponent;
    // Variable que almacena el fixture del componente
    let fixture: ComponentFixture<ProfileComponent>;

    // Se ejecuta antes de cada prueba, se configura el entorno de prueba
    beforeEach(async () => {
        // Se configura el módulo de prueba
        await TestBed.configureTestingModule({
            // Se importa el componente que se va a probar
            imports: [ProfileComponent]
        })
            // Se compila el módulo de prueba
            .compileComponents();

        // Se crea una instancia del componente
        fixture = TestBed.createComponent(ProfileComponent);
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