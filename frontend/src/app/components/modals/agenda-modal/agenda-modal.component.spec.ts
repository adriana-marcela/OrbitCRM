import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaModalComponent } from './agenda-modal.component';

describe('AgendaModalComponent', () => {
    let component: AgendaModalComponent;
    let fixture: ComponentFixture<AgendaModalComponent>;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgendaModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AgendaModalComponent);
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