import { ISuccess, ISuccesssAction } from "../types";
import { ensureElement, formatNumber } from "../utils/utils";
import { Component } from "./base/Components";

export class Success extends Component<ISuccess> {
  protected _total: HTMLElement;
  protected _buttonClose: HTMLButtonElement;

  constructor(container: HTMLElement, actions: ISuccesssAction) {
    super(container);

    this._buttonClose = ensureElement<HTMLButtonElement>('.order-success__close', container);
    this._total = ensureElement<HTMLElement>('.order-success__description', container);

    if (actions?.onClick) {
      this._buttonClose.addEventListener('click', actions.onClick);
    }
  }
  set total(value: number) {
    this.setText(this._total, `Списано ${formatNumber(value)} синапсов`);
  }
}