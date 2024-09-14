import { Form } from "./common/Form";
import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { ensureAllElements } from "../utils/utils";


export class Order extends Form<IOrderForm> {
    protected _buttonsSelectPaymentMethod: HTMLButtonElement[];
    protected _address: HTMLInputElement;
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._buttonsSelectPaymentMethod = ensureAllElements<HTMLButtonElement>('.button_alt', container);
        this._buttonsSelectPaymentMethod.forEach((button) => {
            button.addEventListener('click', () => {
                this.buttonState(button.name);
                this.events.emit(`${this.container.name}.payment:change`, { field: 'payment', value: button.name });            });
        })      
    }

    buttonState(name: string) {
        this._buttonsSelectPaymentMethod.forEach(button => {
          this.toggleClass(button, 'button_alt-active', button.name === name);
          this.setDisabled(button, button.name === name);
        })
      }

      set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}