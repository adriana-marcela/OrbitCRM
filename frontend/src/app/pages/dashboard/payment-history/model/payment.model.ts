export interface paymentHistoryModel {
	id?: number;
	date: string;
	client?: string;
	clientName?: string;
	collaborator?: string;
	collaboratorName?: string;
	price: number;
	service: string;
	currency: string;
	serviceName?: string;
	is_payed: boolean;
}
