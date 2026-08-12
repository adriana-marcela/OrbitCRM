import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://127.0.0.1:8000/';

    constructor(private http: HttpClient) { }

    // Traer toda la información
    getData(endpoint: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${endpoint}/`).pipe(
            catchError(this.handleError)
        );
    }

    // Traer toda la información según parámetro
    getDataBy(endpoint: string, parameter: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${endpoint}/${parameter}/`).pipe(
            catchError(this.handleError)
        );
    }

    // Enviar información
    postData(endpoint: string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/${endpoint}/`, data).pipe(
            catchError(this.handleError)
        );
    }

    // Modificación total
    putData(endpoint: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${endpoint}/`, data).pipe(
            catchError(this.handleError)
        );
    }

    // Borrar un elemento
    deleteData(endpoint: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${endpoint}/`).pipe(
            catchError(this.handleError)
        );
    }

    // Modificación parcial
    patchData(endpoint: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${endpoint}/`, data).pipe(
            catchError(this.handleError)
        );
    }

    // Especiales
    getDataE(endpoint: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${endpoint}`).pipe(
            catchError(this.handleError)
        );
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || refreshToken.trim() === '') {
          console.warn('No se puede renovar: el refresh token está vacío o no existe.');
          return throwError(() => new Error('Token de renovación no disponible'));
        }
        return this.http.post(`${this.apiUrl}/api/token/refresh/`, { refresh: refreshToken }).pipe(
          timeout(5000),
          tap((response: any) => {
            localStorage.setItem('authToken', response.access);
            localStorage.setItem('refresh_token', response.refresh);
          }),
          catchError(this.handleError)
        );
    }

    // Manejo de errores
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Ocurrió un error desconocido.';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `${error.error.detail}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
