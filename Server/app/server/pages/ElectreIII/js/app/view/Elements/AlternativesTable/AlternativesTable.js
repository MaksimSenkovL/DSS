import BaseElement from "../BaseElement/BaseElement.js";

export default class AlternativesTable extends BaseElement {
    #header;
    #body;

    constructor(node) {
        super(node);

        this.#init();
    }

    fillTable(set) {
        console.log(set);
        if (set.parameters.length === 0) {
            this.#clearHeader();
            this.clearNode(this.#body);
            return;
        }
        this.#fillTableHeader(set.parameters);
        this.#fillTableBody(set);
    }

    #fillTableHeader(parameters) {
        this.#clearHeader();

        let HTML = "";
        for (let param of parameters) {
            if (param.toLowerCase() === "label" || param.toLowerCase() === "href") {
                continue;
            }
            HTML += this.#createThHTML(param);
        }

        this.#header.insertAdjacentHTML("beforeend", HTML);
    }

    #createThHTML(columnLabel) {
        const label = columnLabel.length > 5 ? columnLabel.substring(0, 4) + "." : columnLabel;
        return `
            <th class="customTable__element customTable__th customTable__th_w117" data-columnLabel="${columnLabel}">
                <span>${label}</span>
                <div class="customTable__deleteColumnButtonWrapper">
                <button class="customTable__deleteColumnButton" data-deleteButton>
                    &times;
                </button>
                </div>
            </th>
        `;
    }

    #clearHeader() {
        let tmp = this.#header.firstElementChild;
        this.#header.innerHTML = "";
        this.#header.append(tmp);
    }

    #fillTableBody(set) {
        this.clearNode(this.#body);

        let HTML = "";
        for (let alternative of set.data) {
            HTML += this.#createTrHTML(alternative, set.parameters);
        }

        this.#body.insertAdjacentHTML("afterbegin", HTML);
    }

    #createTrHTML(repositoryObj, parameters) {
        let HTML = "<tr>";

        for (let param of parameters) {
            if (param === "href") {
                continue;
            }
            if (param === "label") {
                HTML += this.#createTdWithPHTML(repositoryObj[param]);
                continue;
            }

            HTML += this.#createTdWithInputHTML(repositoryObj[param]);
        }

        HTML += "</tr>";

        return HTML;
    }

    #createTdWithInputHTML(data) {
        return `
            <td class="customTable__element">
                <input type="number" class="customTable__input" value="${data}" />
            </td>
        `;
    }

    #createTdWithPHTML(data) {
        return `
        <td class="customTable__element">
            <p type="text" class="customTable_p" >${data}</p>
        </td>
            `;
    }

    #init() {
        this.#header = this._root.querySelector("thead > tr");
        this.#body = this._root.querySelector("tbody");

        this.#initEventListeners();
    }

    #initEventListeners() {
        this.#header.addEventListener("click", this.#deleteColumnButtonClick.bind(this));
        this.#body.addEventListener("change", this.#alternativeParametrChanged.bind(this));
    }

    #deleteColumnButtonClick(ev) {
        const target = ev.target;
        if (!target.hasAttribute("data-deleteButton")) {
            return;
        }

        // const columnLabel = target.closest("th").dataset.columnLabel;
        const columnLabel = target.closest("th").dataset.columnlabel;

        const event = new CustomEvent("deleteColumn", {
            bubbles: true,
            detail: {
                label: columnLabel,
            },
        });

        this._root.dispatchEvent(event);
    }

    #alternativeParametrChanged(ev) {
        const target = ev.target;

        if (!this.#checkValidity(target)) {
            this.#triggerReportValidity(target);
            return;
        }

        const alternativeLable = this.#findAlternativeLabel(target);
        const parametrLabel = this.#findParametrLabel(target);
        const value = target.value;

        const event = new CustomEvent("alternativeParametrChanged", {
            bubbles: true,
            detail: {
                altLabel: alternativeLable,
                paramLabel: parametrLabel,
                value: value,
            },
        });

        this._root.dispatchEvent(event);
    }

    #checkValidity(inputElement) {
        return inputElement.validity.valid;
    }

    #triggerReportValidity(inputElement) {
        inputElement.reportValidity();
    }

    #findAlternativeLabel(target) {
        return target.closest("tr").firstElementChild.innerText;
    }

    #findParametrLabel(target) {
        const tr = target.closest("tr");
        const index = Array.from(tr.children).indexOf(target.closest("td"));

        const parametrLabel = this.#header.children[index].dataset.columnlabel;

        return parametrLabel;
    }
}
