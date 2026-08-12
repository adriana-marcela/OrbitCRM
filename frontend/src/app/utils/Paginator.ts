import { MatPaginatorIntl } from "@angular/material/paginator";

/**
 * Función que devuelve un objeto de tipo MatPaginatorIntl
 * que contiene las traducciones al español para el componente
 * de paginación de Angular Material.
 */
export function getSpanishPaginatorIntl() {
    const paginatorIntl = new MatPaginatorIntl();

    /**
     * Texto que se muestra en el selector de elementos por página.
     */
    paginatorIntl.itemsPerPageLabel = 'Paginación:';

    /**
     * Texto del botón para ir a la página siguiente.
     */
    paginatorIntl.nextPageLabel = 'Página siguiente';

    /**
     * Texto del botón para ir a la página anterior.
     */
    paginatorIntl.previousPageLabel = 'Página anterior';

    /**
     * Texto del botón para ir a la primera página.
     */
    paginatorIntl.firstPageLabel = 'Primera página';

    /**
     * Texto del botón para ir a la última página.
     */
    paginatorIntl.lastPageLabel = 'Última página';

    /**
     * Función que devuelve el texto que se muestra en el rango de
     * elementos en la paginación.
     *
     * @param page Número de página actual.
     * @param pageSize Número de elementos por página.
     * @param length Número total de elementos en la lista.
     * @returns Texto con el rango de elementos.
     */
    paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
        if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
        }
        const startIndex = page * pageSize;
        const endIndex = Math.min(startIndex + pageSize, length);
        return `${startIndex + 1} - ${endIndex} de ${length}`;
    };

    return paginatorIntl;
}
