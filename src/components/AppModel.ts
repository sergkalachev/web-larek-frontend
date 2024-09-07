import { ProductCategory, IProduct, Events, IOrder, TFormErrors, IOrderForm } from './../types';
import { Model } from './base/Model';

interface IAppModel {
	catalog: IProduct[];
	basket: IProduct[];
    order: IOrder[];
	formErrors: TFormErrors;
}

export class ProductModel extends Model<IProduct> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;
	buttonState: { stateIsNull: boolean; stateInBasket: boolean };
	index: number;

	getStateIsNull() {
		return this.price === null;
	}
}

export class AppModel extends Model<IAppModel> {
	catalog: ProductModel[];
	basket: IProduct[] = [];
    order: IOrder = {
		payment: null,
		email: '',
		phone: '',
		address: '',
		total: null,
		items: [],
	};

    formErrors: TFormErrors = {};

	setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new ProductModel(item, this.events));
        this.emitChanges(Events.GALLERY_CHANGED, { catalog: this.catalog });
	}

    getInBasket(product: IProduct) {
		return !!this.basket.find((item) => item.id === product.id);
	}

    addToBasket(product: IProduct) {
		if (!this.basket.some((item) => item === product)) {
			this.basket.push(product);
		}
	}

    removeFromBasket(product: IProduct) {
		this.basket = this.basket.filter((item) => item !== product);
	}

    clearBasket() {
		this.basket = [];
	}

	clearOrder() {
		this.order = {
			payment: null,
			email: '',
			phone: '',
			address: '',
			total: null,
			items: [],
		};
	}

    setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateContacts() && this.validateOrder()) {
			this.events.emit(Events.ORDER_READY, this.order);
		}
	}

    getTotal() {
		return this.basket.reduce((el, item) => el + item.price, 0);
	}

    validateOrder() {
		const errors: typeof this.formErrors = {};
		const regEmail = new RegExp(/^[\w.-]+@[\w-]+\.[\w-]+$/);
		const regPhone = new RegExp(/^((\+7|7|8)+(9\d{2})+\d{7})$/);

		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		} else if (!regEmail.test(this.order.email)) {
			errors.email = 'Введите корректную почту вида: *****@***.**';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (!regPhone.test(this.order.phone)) {
			errors.phone = 'Введите корректный номер телефона без дефисов и скобок';
		}
		this.formErrors = errors;
		this.events.emit(Events.FORM_ERRORS_CHANGE, this.formErrors);
		return Object.keys(errors).length === 0;
	}

    validateContacts() {
		const errors: typeof this.formErrors = {};
		const regAddress = new RegExp(/^[а-яА-ЯёЁa-zA-Z0-9 ,./]+$/gm);
		if (!this.order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		} else if (!regAddress.test(this.order.address)) {
			errors.address =
				'Разрешены кириллические, латинские буквы, цифры и знаки: , . /';
		}

		this.formErrors = errors;
		this.events.emit(Events.FORM_ERRORS_CHANGE, this.formErrors);
		return Object.keys(errors).length === 0;
	}
}