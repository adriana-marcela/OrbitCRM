/**
 * Archivo de pruebas para el servicio AuthGuard
 */
import { TestBed } from '@angular/core/testing';

/**
 * Importa el servicio que se va a probar
 */
import { AuthGuard } from '../auth/auth-guard.service';

/**
 * Describe la suite de pruebas para el servicio AuthGuard
 */
describe('AuthGuardService', () => {
    /**
     * Variable que almacena la instancia del servicio
     */
    let service: AuthGuard;

    /**
     * Se ejecuta antes de cada prueba, se configura el entorno de prueba
     */
    beforeEach(() => {
        /**
         * Se configura el módulo de prueba
         */
        TestBed.configureTestingModule({});
        /**
         * Se obtiene una instancia del servicio
         */
        service = TestBed.inject(AuthGuard);
    });

    /**
     * Verifica que el servicio se haya creado correctamente
     */
    it('should be created', () => {
        /**
         * Verifica que el servicio sea verdadero
         */
        expect(service).toBeTruthy();
    });
});