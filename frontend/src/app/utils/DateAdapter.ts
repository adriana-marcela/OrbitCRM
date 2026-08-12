/**
 * Clase que hereda de NativeDateAdapter para personalizar el formato de fecha.
 *
 * Al extender la clase NativeDateAdapter, se puede personalizar el formato de
 * fecha que se muestra en los componentes de material design.
 *
 * En este caso, se ha sobrescrito el método format() para que devuelva una cadena
 * en formato "dd/MM/yyyy".
 */
import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
    /**
     * Sobrescribe el método format() de NativeDateAdapter para personalizar el
     * formato de fecha.
     *
     * @param date La fecha a formatear.
     * @param displayFormat El formato de fecha a utilizar.
     * @returns La fecha en formato "dd/MM/yyyy".
     */
    override format(date: Date, displayFormat: Object): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}