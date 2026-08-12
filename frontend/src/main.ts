/**
 * Crea la aplicación y la renderiza en el elemento <body>
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Inicializa la aplicación
 */
async function bootstrap() {
    try {
        await bootstrapApplication(AppComponent, appConfig);
    } catch (err) {
        console.error(err);
    }
}

// Inicializa la aplicación
void bootstrap();