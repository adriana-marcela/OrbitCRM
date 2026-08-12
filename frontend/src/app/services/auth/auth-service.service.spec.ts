// Importa el módulo de pruebas de Angular
import { TestBed } from '@angular/core/testing';

// Importa el servicio que se va a probar
import { AuthService } from '../auth/auth-service.service';

// Describe la suite de pruebas para el servicio AuthServiceService
describe('AuthServiceService', () => {
    // Variable que almacena la instancia del servicio
    let service: AuthService;

    // Se ejecuta antes de cada prueba, se configura el entorno de prueba
    beforeEach(() => {
        // Se configura el módulo de prueba
        TestBed.configureTestingModule({});
        // Se obtiene una instancia del servicio
        service = TestBed.inject(AuthService);
    });

    // Verifica que el servicio se haya creado correctamente
    it('should be created', () => {
        // Verifica que el servicio sea verdadero
        expect(service).toBeTruthy();
    });
});