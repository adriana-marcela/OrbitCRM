export interface simpleClientModel {
	id: number;
	email: string;
	photo: string;
	fullname: string;
}

export interface clientModel {
	id: number;
	photo: string;
	name: string;
	lastname: string;
	description: string;
	documentType: string;
	documentNumber: number;
	rol: number;
	position: string;
	birthday: string;
	email: string;
	address: string;
	phone: string;
	country: string;
	department: string;
	city: string;

	//Información Tributaria
	corporate_name: string;
	company_name: string;
	taxpayer_type: string;
	tributary_id: string;
	tributary_number: string;
	tax_liability: string;
	tax_id_type: string;
	regime_type: string;
	rut: string;
	c_commerce: string;
	// tributarias adicionales
	tributarys: [];
	// Información adicional
	contact: contactModel;
	payment: paymentHistoryModel[];
	services: complementModel[];
	complements: complementModel[];
	activities: activiteModel[];
}

export interface contactModel {
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

export interface paymentHistoryModel {
    id?: number | null;
    date: string;
    service?: number;
    serviceName: string;
    price: number;
}

export interface complementModel {
    id?: number | null;
    service: number;
    name?: string;
    startDate: string;
    expirationDate: string;
    price: number | null;
}

export interface activiteModel {
    id?: number | null;
    title: string;
    description: string;
    files: string[];
    status: 'Pendiente' | 'En Progreso' | 'Completada';
}
