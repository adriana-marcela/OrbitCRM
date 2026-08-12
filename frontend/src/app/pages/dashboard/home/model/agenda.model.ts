export interface agendaModel {
    id?: number;
    time: string;
    date: string;
    title?: string;
    priority: string;
    subtext?: string;
    completed: boolean;
    corporate_name?: string;
}