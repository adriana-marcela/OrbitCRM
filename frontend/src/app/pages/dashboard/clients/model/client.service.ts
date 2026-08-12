// src/app/clientes/servicios/clientes.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { clientModel } from './client.model';

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    private clientes: clientModel[] = [];

    constructor() { }

    getClientes(): Observable<clientModel[]> {
        return of(this.clientes);
    }

    getClienteById(id: number): Observable<clientModel | undefined> {
        const cliente = this.clientes.find(c => c.id === id);
        return of(cliente);
    }

    addCliente(cliente: clientModel): Observable<clientModel> {
        cliente.id = this.clientes.length + 1;
        this.clientes.push(cliente);
        return of(cliente);
    }

    updateCliente(updatedCliente: clientModel): Observable<clientModel | undefined> {
        const index = this.clientes.findIndex(c => c.id === updatedCliente.id);
        if (index !== -1) {
            this.clientes[index] = updatedCliente;
            return of(updatedCliente);
        }
        return of(undefined);
    }

    // Métodos para manejar servicios, componentes, actividades, etc., pueden añadirse aquí
}
