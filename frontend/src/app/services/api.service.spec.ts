import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

/**
 * Pruebas unitarias del ApiService
 */
describe('ApiService', () => {
    let service: ApiService;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ApiService);
    });

    /**
     * Verifica que el servicio se haya creado correctamente
     */
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});