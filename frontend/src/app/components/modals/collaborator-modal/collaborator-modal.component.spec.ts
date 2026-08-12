import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorModalComponent } from './collaborator-modal.component';

/**
 * Pruebas unitarias del componente CollaboratorModalComponent
 */
describe('CollaboratorsModalComponent', () => {
    let component: CollaboratorModalComponent;
    let fixture: ComponentFixture<CollaboratorModalComponent>;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CollaboratorModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CollaboratorModalComponent);
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

