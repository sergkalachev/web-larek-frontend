import {Component} from "../base/Components";
import { ensureElement, formatNumber, createElement} from "../../utils/utils";
import {EventEmitter} from "../base/events";

interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }
        this.items = [];
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this.setDisabled(this._button, false); //показываем кнопку оформления заказа
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
            this.setDisabled(this._button, true); //блокируем кнопку оформления заказа
        }
    }

    set total(total: number) {
        this.setText(this._total, formatNumber(total));
    }
}