export interface userModel {
    photo: string;
    name?: string;
    lastname?: string;
    position?: string;
    documentType: string;
    documentNumber: number;
    email: string;
    country: string;
    department: string;
    city: string;
    address: string;
    phone: string;
    currentPassword?: string;
    newPassword?: string;
}