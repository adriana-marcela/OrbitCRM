export interface Contacts {
    fullname: string;
    email: string;
    position: string;
    photo?: string;
    chat?: Chat;
    last_message?: string;
	last_message_date?: Date;
	is_staff: boolean;
    // isActive?: string;
}
export interface Chat {
    recipient: string;
    messages: Message[];
}

export interface Message {
    id?: number;
    sender?: string;
    text: string;
    date?: Date;
}
