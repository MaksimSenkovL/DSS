import BaseElement from "../BaseElement/BaseElement.js";

export default class NewSetDialog extends BaseElement {
    #setLabelElement;
    #createButtonElement;
    #cancelButtonElement;

    constructor(node) {
        super(node);

        this.#init();
    }

    showModal() {
        this._root.showModal();
    }

    closeModal() {
        this._root.close();
    }

    #init() {
        this.#setLabelElement = this._root.querySelector("[data-label]");
        this.#createButtonElement = this._root.querySelector("[data-create]");
        this.#cancelButtonElement = this._root.querySelector("[data-cancel]");

        this.#initEventListeners();
    }

    #initEventListeners() {
        this.#createButtonElement.addEventListener("click", this.#createButtonClick.bind(this));
        this.#cancelButtonElement.addEventListener("click", this.#cancelButtonClick.bind(this));

        this._root.addEventListener("click", this.#closeDialogIfClickNotInRect.bind(this));
    }

    #createButtonClick() {
        const label = this.#setLabelElement.value;

        if (label.length === 0) {
            return;
        }

        const event = new CustomEvent("createSet", {
            bubbles: true,
            detail: { label: label },
        });

        this._root.dispatchEvent(event);
    }

    #cancelButtonClick() {
        this._root.close();
    }

    #closeDialogIfClickNotInRect(event) {
        const dialogDimensions = this._root.getBoundingClientRect();

        if (
            event.clientX < dialogDimensions.left ||
            event.clientX > dialogDimensions.right ||
            event.clientY < dialogDimensions.top ||
            event.clientY > dialogDimensions.bottom
        ) {
            this._root.close();
        }
    }
}
