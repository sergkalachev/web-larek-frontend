import {Model} from "./base/Model";
import { IProduct, IOrder, IAppState, FormErrors, IContactsForm, IOrderForm } from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProduct> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
    productInBasket: boolean;
}

export class AppState extends Model<IAppState> {
    basket: ProductItem[] = [];
    catalog: ProductItem[] = [];
    order: IOrder = {
        address: '',
        email: '',
        phone: '',
        payment: '',
        items: [],
		total: 0
    };
    preview: string | null;
    formErrors: FormErrors = {};

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    getProductsInBasket() {
        return this.catalog.filter(item => item.productInBasket);
    }

    addToBasket(item: ProductItem) {
        this.catalog.find(product => item.id === product.id).productInBasket = true;
    }

    removeFromBasket(item: ProductItem) {
        this.catalog.find(product => item.id === product.id).productInBasket = false;
    }

    getTotalPrice() {
        return this.getProductsInBasket().reduce((acc, item) => acc + item.price, 0);
    }
    clearBasket() {
        this.basket = [];
	}

    clearOrder() {
		this.order = {
			payment: '',
			email: '',
			phone: '',
			address: '',
			total: null,
			items: [],
		};
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        this.validateOrderForm()
    }
    setContactField(field: keyof IContactsForm, value: string) {
		this.order[field] = value;
		this.validateContactsForm()
	}

    validateOrderForm() {
        const errors: typeof this.formErrors = {};
        if (!this.order.address) {
            errors.address = 'Заполните адрес доставки';
        } 
        if (!this.order.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        this.formErrors = errors;
        this.events.emit('formOrderErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContactsForm() {
        const errors: typeof this.formErrors = {};
        const emailREGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const phoneREGEX = /^\+7[0-9]{10}$/;
        if (!this.order.email) {
            errors.email = 'Заполните номер телефона';
        }
        if (!emailREGEX.test(this.order.email)) {
            errors.email = 'Неправильно введен адрес электронной почты';
        }
        if (!this.order.phone) {
            errors.phone = 'Заполните адрес электронной почты';
        }
        if (!phoneREGEX.test(this.order.phone)) {
            errors.phone = 'Неправильно введен номер телефона';
        }
        this.formErrors = errors;
        this.events.emit('formContactsErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    getOrder(): IOrder {
		this.order.total = this.getTotalPrice();
		this.order.items = this.getProductsInBasket().map(item => item.id);
		return this.order;
	}
}
