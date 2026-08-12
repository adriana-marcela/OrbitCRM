/**
 * Interceptador que se encarga de agregar el token de autenticación a las
 * peticiones HTTP que se realizan a la API.
 *
 * Si el token de autenticación existe en el local storage, se agrega a la
 * petición HTTP en el header 'Authorization'.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth-service.service';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpEvent } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const accessToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refresh_token');
    const router = inject(Router); // Inyección del enrutador para redirigir al login
    const authService = inject(AuthService);
    
    if (!accessToken) return next(req); // no hay token, continúa normal
    
    if (req.url.includes('/api/token/refresh/')) {
        return next(req); // no interceptar refresh
    }
    
    const isExpiringSoon = authService.isTokenExpiringSoon(accessToken);

    const attachToken = (token: string) => {
        return req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
    };

    const proceedWithToken = (token: string) => {
        const clonedReq = attachToken(token);
        return next(clonedReq);
    };

    // Token está por expirar, intenta renovarlo
    if (isExpiringSoon && refreshToken) {
        return authService.refreshToken().pipe(
            switchMap((response: any) => {
                return proceedWithToken(response.access);
            }),
            catchError((refreshError) => {
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => new Error('Error al renovar el token'));
            })
        );
    }

    // Token está bien, seguimos normal
    return proceedWithToken(accessToken).pipe(
        catchError((error) => {
            if (error.status === 401) {
                authService.logout();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
