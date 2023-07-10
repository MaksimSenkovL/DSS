import BaseElement from "../BaseElement/BaseElement.js";

export default class AddNewAlternativeForm extends BaseElement {
    #tableBodyRow;
    constructor(node) {
        super(node);

        this.#init();
    }

    getFormData() {
        const fd = new FormData(this._root);

        return Object.fromEntries(fd.entries());
    }

    addNewColumn() {
        console.log(this._root);
    }

    fillTable(parameters) {
        this.#clearTable();

        let HTML = "";

        for (let param of parameters) {
            if (param.toLowerCase() === "label" || param.toLowerCase() === "href") {
                continue;
            }

            HTML += this.#createTdWithInputHTML(param);
        }
        this.#tableBodyRow.insertAdjacentHTML("beforeend", HTML);
    }

    #clearTable() {
        let tmp = this.#tableBodyRow.firstElementChild;

        this.#tableBodyRow.innerHTML = "";
        this.#tableBodyRow.append(tmp);
    }

    #createTdWithInputHTML(paramLabel) {
        return `
            <td class="customTable__element customTable__element_w117">
                <input type="number" class="customTable__input" name="${paramLabel}"  required/>
            </td>
        `;
    }

    #init() {
        this.#tableBodyRow = this._root.querySelector("tbody > tr");
        this.#initEventListeners();
    }

    #initEventListeners() {
        this._root.addEventListener("submit", this.#submit.bind(this));
    }

    #submit(e) {
        e.preventDefault();
        const data = this.getFormData();

        const event = new CustomEvent("submitAlternativesForm", {
            bubbles: true,
            detail: {
                data: data,
            },
        });

        this._root.dispatchEvent(event);
    }
}
