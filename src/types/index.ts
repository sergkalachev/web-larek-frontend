export interface IProduct {
    id: number
    description: string
    image: string
    title: string
    category: string
    price: number | null
    productInBasket?: boolean
}

export interface IAppState {
    catalog: IProduct[];
    basket: IProduct[];
    order: IOrder;
}

export interface IOrder {
    address: string;
    email: string;
    phone: string;
    payment: string;
    total: number;
	items: string[];
}

export interface IOrderForm {
    payment: string;
    address: string;
}

export interface IContactsForm {
	email: string;
	phone: string;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface ISuccess {
	total: number;
}

export interface ISuccesssAction {
	onClick: () => void;
}

export interface IOrderResult {
	id: string;
	total: number;
}
