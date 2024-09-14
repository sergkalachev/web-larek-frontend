import { Component } from "./base/Components";
import { IProduct } from "../types";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard extends IProduct {
    previewButtonName: boolean;
    basketItemIndex? : number;
}

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected actions: ICardActions) {
        super(container);

        this._title = container.querySelector('.card__title');
        this._image = container.querySelector('.card__image');
        this._description = container.querySelector('.card__text');
        this._category = container.querySelector('.card__category');
        this._price = container.querySelector('.card__price');
        this._button = container.querySelector('.card__button');

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
    }
}
set title(value: string) {
    this.setText(this._title, value);
}

set description(value: string) {
    this.setText(this._description, value);
}

set image(value: string) {
    this.setImage(this._image, value);
}

set price(value: number | null) {
    if (value === null) {
        this.setText(this._price, 'Бесценно');
        this.setDisabled(this._button, true);
    } else {
        this.setText(this._price, String(value) + ' синапсов');
    }
}

set previewButtonName(productInBasket: boolean) {
    if (!productInBasket) {
        this.setText(this._button, 'В корзину');
    }else{
        this.setText(this._button, 'Убрать из корзины');
    }
}

set category(value: string) {
    this.setText(this._category, value);
    if (value === 'софт-скил') {
        this._category.classList.add('card__category_soft');
    } else if (value === 'другое') {
        this._category.classList.add('card__category_other');
    } else if (value === 'дополнительное') {
        this._category.classList.add('card__category_additional');
    } else if (value === 'кнопка') {
        this._category.classList.add('card__category_button');
    } else if (value === 'хард-скил') {
        this._category.classList.add('card__category_hard');
    }
}  
}

export class CardInBasket extends Card {
	protected _basketItemIndex: HTMLElement;

	constructor(container: HTMLElement, actions: ICardActions) {
		super(container, actions);
		this._basketItemIndex = container.querySelector('.basket__item-index');
	}

	set basketItemIndex(value: number) {
		this.setText(this._basketItemIndex, value.toString());
	}
}