import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';

/**
 * Pruebas unitarias del componente SidebarComponent
 */
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
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

