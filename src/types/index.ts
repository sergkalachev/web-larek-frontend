export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;
}

export enum ProductCategory {
	'софт-скил' = 'soft',
	'хард-скил' = 'hard',
	'другое' = 'other',
	'дополнительное' = 'additional',
	'кнопка' = 'button',
}

export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number | null;
	items: string[];
}

export type IOrderForm = Partial<Omit<IOrder, 'total' | 'items'>>; // формы заказа

export type TFormErrors = Partial<Record<keyof IOrderForm, string>>; // ошибки формы

export interface IOrderResult {
	id: string;
	total: number;
} 

// Api

export type TApiPostMethods = 'POST' | 'PUT';

export interface IApi {
	baseUrl: string;
	get<T>(uri: string): Promise<T>;
	post<T>(uri: string, data: object, method?: TApiPostMethods): Promise<T>;
}

// Events

export enum Events {
	GALLERY_CHANGED = 'gallery:changed',
	PREVIEW_SELECT = 'preview:select',
	MODAL_OPEN = 'modal:open',
	MODAL_CLOSE = 'modal:close',
	PRODUCT_ADD_TO_BASKET = 'product:add-to-basket',
	PRODUCT_DELETE_FROM_BASKET = 'product:delete-from-basket',
    BASKET_OPEN = 'basket:open',
    BASKET_CHANGE = 'basket:change',
	ORDER_OPEN = 'order:open',
	ORDER_SUBMIT = 'order:submit',
	FORM_ERRORS_CHANGE = 'formErrors:change',
	CONTACTS_SUBMIT = 'contacts:submit',
	ORDER_READY = 'order:ready',
	ORDER_CLEAN = 'order:clean',
}