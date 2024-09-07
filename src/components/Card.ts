import { Component } from './base/Components';
import { ensureElement } from './../utils/utils';
import { ProductModel } from '../components/AppModel';
import { IEvents } from './base/events';
import { ProductCategory } from './../types';

interface ICardEvents {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ProductModel> {
	protected cardTitle: HTMLElement;
	protected cardPrice: HTMLElement;
	protected cardButton: HTMLButtonElement;

	constructor( protected container: HTMLElement, protected actions?: ICardEvents) {
		super(container);
		this.cardTitle = ensureElement<HTMLElement>('.card__title', this.container);
		this.cardPrice = ensureElement<HTMLElement>('.card__price', this.container);
		this.cardButton = container.querySelector('.card__button');
	}

	set title(value: string) {
		this.setText(this.cardTitle, value);
	}

	set price(value: number | null) {
		if (value !== null) {
			this.setText(this.cardPrice, `${value} синапсов`);
		} else {
			this.setText(this.cardPrice, 'Бесценно');
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}
}

export class CardCatalog extends Card {
	protected cardImage: HTMLImageElement;
	protected cardCategory: HTMLElement;

	constructor(
		protected container: HTMLElement,
		protected actions?: ICardEvents
	) {
		super(container);
		this.cardImage = ensureElement<HTMLImageElement>('.card__image',this.container);
		this.cardCategory = ensureElement<HTMLElement>('.card__category',this.container);

		if (actions?.onClick) {
			if (this.cardButton) {
				this.cardButton.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set image(value: string) {
		this.setImage(this.cardImage, value, this.title);
	}

	set category(value: keyof typeof ProductCategory) {
		if (this.cardCategory) {
			this.setText(this.cardCategory, value);
			this.cardCategory.classList.add(`card__category_${ProductCategory[value]}`);
		}
	}
}

export class CardPreview extends CardCatalog {
	protected cardDescription: HTMLElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEvents,
		protected actions?: ICardEvents
	) {
		super(container, actions);
		this.cardDescription = ensureElement<HTMLElement>('.card__text',this.container);
	}

	set description(value: string) {
		this.setText(this.cardDescription, value);
	}

	set buttonState(state: { stateIsNull: boolean; stateInBasket: boolean }) {
		if (this.cardButton) {
			if (state.stateIsNull) {
				this.setDisabled(this.cardButton, true);
				this.setText(this.cardButton, 'Не доступно');
			}
			if (state.stateInBasket) {
				this.setText(this.cardButton, state.stateInBasket ? 'Убрать' : 'Купить'
				);
			}
		}
	}
}

export class CardBasket extends Card {
	protected cardIndex: HTMLElement;

	constructor(
		protected container: HTMLElement,
		protected actions?: ICardEvents
	) {
		super(container);

		this.cardIndex = ensureElement<HTMLElement>(`.basket__item-index`,container);
		this.cardButton.addEventListener('click', actions.onClick);
	}

	set index(value: number) {
		this.cardIndex.textContent = String(value);
	}
}