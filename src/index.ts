import './scss/styles.scss';
import { WebLarekAPI } from './components/WebLarekAPI';
import { API_URL, CDN_URL} from "./utils/constants";
import { AppState, CatalogChangeEvent, ProductItem } from './components/AppData';
import { EventEmitter} from "./components/base/events";
import { Page} from "./components/Page";
import { Card, CardInBasket} from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { IOrderForm, IContactsForm, IOrderResult } from './types';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';


const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Контейнеры с шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => {
		modal.close();
	},
});

// Отображаем продукты на странице
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
        });
    });
    page.counter = appData.getProductsInBasket.length;
});

// Открыть карточку продукта
events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
});

// Открыть модальное окно c детальной информацией о товаре
events.on<ProductItem> ('preview:changed', (item: ProductItem) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
            if (item.productInBasket) {
				appData.removeFromBasket(item);
			} else {
				appData.addToBasket(item);
			}
			modal.close();
			events.emit('basket:changed');
		},
	});

	modal.render({
		content: card.render({
            title: item.title,
			image: item.image,
			category: item.category,
			description: item.description,
			price: item.price,
            previewButtonName: item.productInBasket,
		}),
	});
});

// Отображаем содержимое корзины
events.on('basket:changed', () => {
	const cards = appData.getProductsInBasket().map((item, basketItemIndex) => {
		const cardInBasket = new CardInBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.removeFromBasket(item);
				events.emit('basket:changed', item);
			},
		});
		return cardInBasket.render({
			title: item.title,
			price: item.price,
            basketItemIndex: basketItemIndex + 1,
		});
	});
	basket.items = cards;
	page.counter = appData.getProductsInBasket().length;
    basket.total = appData.getTotalPrice();
});

// Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: order.render({
            payment: '',
            address: '',
            valid: false,
            errors: []
        }) 
    });
});

// Изменилось состояние валидации формы
events.on('formOrderErrors:change', (errors: Partial<IOrderForm>) => {
    const { payment, address } = errors;
    order.valid = !payment && !address;
    order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});

events.on('formContactsErrors:change', (errors: Partial<IContactsForm>) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей на заказе
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Изменилось одно из полей заполнения контактной информации
events.on(/^contacts\..*:change/,(data: { field: keyof IContactsForm; value: string }) => {
	appData.setContactField(data.field, data.value);
	}
);

// Контактная информация
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

// Сабмит заказа
events.on('contacts:submit', () => {
	api.submitOrder(appData.getOrder())
		.then((result: IOrderResult) => {
            appData.clearBasket();
            appData.clearOrder();
            page.counter = appData.getProductsInBasket().length;
			modal.render({
				content: success.render({
					total: result.total,
				}),
			});
			events.emit('basket:changed');
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
    events.emit('basket:changed');
});

// Получаем продукты с сервера
api.getProductList()
    // .then(data => console.log(data))
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
});

    
