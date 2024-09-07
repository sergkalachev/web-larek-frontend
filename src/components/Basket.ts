import { Component } from './base/Components';
import { createElement, ensureElement } from './../utils/utils';

interface IBasketActions {
	onClick: () => void;
}

interface IBasket {
	items: HTMLElement[];
	total: number;
}

export class Basket extends Component<IBasket> {
	protected _basketList: HTMLElement;
	protected _total: HTMLElement;
	protected _actionButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, actions: IBasketActions) {
		super(container);

		this._basketList = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._actionButton = ensureElement<HTMLButtonElement>('.basket__button',this.container);

		this._actionButton.addEventListener('click', actions.onClick);
	}

	disabledButton(valid: boolean) {
		this.setDisabled(this._actionButton, valid);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._basketList.replaceChildren(...items);
			this.disabledButton(false);
		} else {
			this._basketList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.disabledButton(true);
		}
	}

	set total(total: number) {
		this.setText(this._total, `${String(total)} синапсов`);
	}

	render(data?: IBasket) {
		if (!data) return this.container;
		return super.render({ items: data.items, total: data.total });
	}
}