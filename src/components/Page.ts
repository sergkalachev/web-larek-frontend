import { Component } from './base/Components';
import { IEvents } from './base/events';
import { ensureElement } from './../utils/utils';

interface IPage {
	gallery: HTMLElement;
	counter: number;
	lockedWrapper: boolean;
	basketButton: HTMLButtonElement;
}

export class Page extends Component<IPage> {
	protected _gallery: HTMLElement;
	protected _counter: HTMLSpanElement;
	protected _lockedWrapper: HTMLElement;
	protected _basketButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);
		this._gallery = ensureElement<HTMLElement>('.gallery', this.container);
		this._counter = ensureElement<HTMLSpanElement>('.header__basket-counter', this.container);
		this._lockedWrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);
		this._basketButton = ensureElement<HTMLButtonElement>('.header__basket',this.container);

		this._basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}
	set counter(value: number) {
		this.setText(this._counter, value.toString());
	}
    
	set gallery(items: HTMLElement[]) {
		this._gallery.replaceChildren(...items);
	}

	set locked(value: boolean) {
		if (value === true) {
		this._lockedWrapper.classList.add('page__wrapper_locked');
	} else {
		this._lockedWrapper.classList.remove('page__wrapper_locked');
	}
}
}