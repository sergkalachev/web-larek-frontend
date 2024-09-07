import './scss/styles.scss';

import { WebLarekAPI } from './components/WebLarekAPI'; 
import { AppModel, ProductModel } from './components/AppModel'; 
import { EventEmitter } from './components/base/events'; 
import { Events, IOrderForm, IProduct } from './types';
import { Page } from './components/Page';
import { 
	cloneTemplate, 
	createElement, 
	ensureElement 
} from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';
import { API_URL, CDN_URL } from './utils/constants';
import {
	CardCatalog,
	CardPreview,
	CardBasket,
} from './components/Card';

// Все контейнеры и шаблоны
const pageContainer = ensureElement<HTMLBodyElement>('.page');
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const api = new WebLarekAPI(CDN_URL, API_URL);
const events = new EventEmitter();

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Модель данных приложения
const appModel = new AppModel({}, events);

// Экземпляры классов
const page = new Page(pageContainer, events);
const modal = new Modal(modalContainer, events);
const basket = new Basket(cloneTemplate(basketTemplate), {
	onClick: () => {
		appModel.order.total = appModel.getTotal();
		appModel.order.items = appModel.basket.map((item) => item.id);
		events.emit(Events.ORDER_OPEN);
		appModel.validateOrder();
	},
});
const order = new Order (cloneTemplate(orderTemplate), events);
const contacts = new Contacts (cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successOrderTemplate), {
	onClick: () => modal.close(),
});

// Выводим товары на главной странице
events.on(Events.GALLERY_CHANGED, () => {
	page.gallery = appModel.catalog.map((item: ProductModel) => {
		const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit(Events.PREVIEW_SELECT, item),
		});
		return card.render({
			image: item.image,
			title: item.title,
			category: item.category,
			price: item.price,
		});
	});
	page.counter = appModel.basket.length;
});

api.getProductList()
.then((res) => appModel.setCatalog(res))
.catch((err) => console.log(err));

// выбор товара в карточке
events.on(Events.PREVIEW_SELECT, (product: ProductModel) => {
	const card = new CardPreview(cloneTemplate(cardPreviewTemplate), events, {
		onClick: () => {
			if (appModel.getInBasket(product)) {
				events.emit(Events.PRODUCT_DELETE_FROM_BASKET, product);
				modal.close();
			} else {
				events.emit(Events.PRODUCT_ADD_TO_BASKET, product);
			}
		},
	});
	modal.render({
		content: card.render({
			description: product.description,
			image: product.image,
			title: product.title,
			category: product.category,
			price: product.price,
			buttonState: {
				stateIsNull: product.getStateIsNull(),
				stateInBasket: appModel.getInBasket(product),
			},
		}),
	});

    // Добавление товара в корзину
    events.on(Events.PRODUCT_ADD_TO_BASKET, (product: IProduct) => {
	    appModel.addToBasket(product);
	    page.counter = appModel.basket.length;
	    modal.close();
    });

    // Удаление товара из корзины
    events.on(Events.PRODUCT_DELETE_FROM_BASKET, (product: IProduct) => {
        appModel.removeFromBasket(product);
	    page.counter = appModel.basket.length;
    });

    // Открытие корзины
    events.on(Events.BASKET_OPEN, () => {
        modal.render({
		    content: basket.render(),
	    });
	    events.emit(Events.BASKET_CHANGE);
    });

    // Корзина изменилась
    events.on(Events.BASKET_CHANGE, () => {
	    const items = appModel.basket.map((item, index) => {
		    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
			    onClick: () => {
				    events.emit(Events.PRODUCT_DELETE_FROM_BASKET, item);
				    events.emit(Events.BASKET_CHANGE);
			    },
		    });
		    return card.render({
			    id: item.id,
			    index: index + 1,
			    title: item.title,
			    price: item.price,
		    });
	    });
	    basket.render({
		    items,
		    total: appModel.getTotal(),
	    });
    });

    // Открытие оформления заказа
	
    events.on(Events.ORDER_OPEN, () => {
	    modal.render({
		    content: order.render({
			    formErrors: [],
				valid: false
		    }),
	    });
	    appModel.validateOrder();
    });

// Заполнена первая форма заказа
    events.on(Events.ORDER_SUBMIT, () => {
	    modal.render({
		    content: contacts.render({
			valid: false,
			formErrors: [],
		}),
	});
	appModel.validateContacts();
});

// Заполнен весь заказ
events.on(Events.CONTACTS_SUBMIT, () => {
	api.postOrder({
			...appModel.order,
		})
		.then((res) => {
			modal.render({
				content: success.render({
					total: res.total,
				}),
			});
			events.emit(Events.ORDER_CLEAN);
		})
		.catch((err) => {
			console.log(err);
			modal.render({
				content: createElement('p', {
					textContent: 'Что-то пошло не так. Попробуйте позже.',
				}),
			});
		});
});

// Очистка корзины и заказа
events.on(Events.ORDER_CLEAN, () => {
	appModel.clearBasket();
	appModel.clearOrder();
	page.counter = appModel.basket.length;
});

// Изменилось состояние валидации формы
events.on(Events.FORM_ERRORS_CHANGE, (errors: Partial<IOrderForm>) => {
	const { payment, address, email, phone } = errors;
	order.valid = !payment && !address;
	order.formErrors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join(';  ');
	contacts.valid = !email && !phone;
	contacts.formErrors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
events.on(
	/(^order|^contacts)\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appModel.setOrderField(data.field, data.value);
	}
);
    // Блокировка страницы
    events.on(Events.MODAL_OPEN, () => {
	page.locked= true;
});
    // Разблокировка страницы
    events.on(Events.MODAL_CLOSE, () => {
	page.locked = false;
});

});