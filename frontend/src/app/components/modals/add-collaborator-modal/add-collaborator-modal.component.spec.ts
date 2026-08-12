import { ComponentFixture, TestBed } from '@angular/core/testing';

/**
 * Importa el componente que se va a probar
 */
import { AddCollaboratorModalComponent } from './add-collaborator-modal.component';

/**
 * Descripción de las pruebas del componente AddCollaboratorModalComponent
 */
describe('AddCollaboratorModalComponent', () => {
    let component: AddCollaboratorModalComponent;
    let fixture: ComponentFixture<AddCollaboratorModalComponent>;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddCollaboratorModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AddCollaboratorModalComponent);
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