import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

/**
 * Pruebas unitarias del componente AppComponent
 */
describe('AppComponent', () => {
    /**
     * Configura el entorno de pruebas antes de que se ejecuten las pruebas
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
        }).compileComponents();
    });

    /**
     * Verifica que el componente se haya creado correctamente
     */
    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    /**
     * Verifica que el título del componente sea 'frontend'
     */
    it(`should have the 'frontend' title`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('frontend');
    });

    /**
     * Verifica que el componente renderice el título correctamente
     */
    it('should render title', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h1')?.textContent).toContain('Hello, frontend');
    });
});