import BaseElement from "../BaseElement/BaseElement.js";

export default class SelectRepository extends BaseElement {
    constructor(node) {
        super(node);

        this.#initEventListeners();
    }

    fillSelect(setsObj) {
        this.removeChildrens(this._root);

        let HTML = "";
        for (let setLabel of setsObj) {
            HTML += this.#createOptionHTMLWithSetLabel(setLabel);
        }

        this._root.insertAdjacentHTML("afterbegin", HTML);
    }

    setValue(label) {
        this._root.value = label;
    }

    #createOptionHTMLWithSetLabel(setLabel) {
        return `
                <option class="optionRepository" value="${setLabel}">${setLabel}</option>
                `;
    }

    #initEventListeners() {
        this._root.addEventListener("change", this.#changeSelectedRepository.bind(this));
    }

    #changeSelectedRepository() {
        const label = this._root.options[this._root.selectedIndex].value;
        const event = new CustomEvent("selectChange", {
            bubbles: true,
            detail: { label: label },
        });

        this._root.dispatchEvent(event);
    }
}
