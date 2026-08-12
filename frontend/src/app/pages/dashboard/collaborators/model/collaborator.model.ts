export interface paymentHistoryModel {
    id?: number;
    date: string;
    service?: number;
    serviceName: string;
    price: number;
}

export interface simpleCollaboratorModel{
	email: string;
	fullname: string;
	rol?: string;
	photo?: string;
	corporate_name?: string;
}

export interface collaboratorModel {
	photo?: string;
	name: string;
	lastname?: string;
	description: string;
	documentType: string;
	documentNumber: number;
	email: string;
	country: string;
	department: string;
	city: string;
	address: string;
	phone: string;
	rol: number;
	birthday: string;
	password: string;
	accountType?: string;
	bank?: string;
	assigned_clients?: any[]
	holderBank?: string;
	accountNumber?: number;
	paymentHistory: paymentHistoryModel[];
}
