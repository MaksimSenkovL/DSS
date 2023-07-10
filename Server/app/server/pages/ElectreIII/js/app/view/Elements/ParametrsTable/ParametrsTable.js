import BaseElement from "../BaseElement/BaseElement.js";

export default class ParametrTable extends BaseElement {
    #body;
    #parametersRows;
    constructor(node) {
        super(node);

        this.#init();
    }

    getParameters() {
        const obj1 = {};

        const isTableCorrect = this.#checkValidity(this.#body);
        if (!isTableCorrect) {
            return obj1;
        }

        const rows = this.#getRows(this.#body);

        for (let row of rows) {
            const rowLabel = this.#getRowLabel(row);

            const parametrs = Array.from(row.querySelectorAll("[data-columnLabel]"));

            const obj = {};

            for (let param of parametrs) {
                const label = param.dataset.columnlabel;
                const value = param.value;

                obj[label] = value;
            }

            obj1[rowLabel] = obj;
        }

        return obj1;
    }

    fillTable(parameters) {
        this.#fillTableBody(parameters);
    }

    #fillTableBody(parameters) {
        this.#clearTable();

        let rowHTML = this.#createRow(parameters);

        for (let row of this.#parametersRows) {
            row.insertAdjacentHTML("beforeend", rowHTML);
        }
    }

    #clearTable() {
        for (let row of this.#parametersRows) {
            let tmp = row.firstElementChild;

            row.innerHTML = "";
            row.append(tmp);
        }
    }

    #createRow(parameters) {
        let HTML = "";
        for (let param of parameters) {
            if (param.toLowerCase() === "label" || param.toLowerCase() === "href") {
                continue;
            }
            HTML += this.#createTdWithInputHTML(param);
        }
        return HTML;
    }
    #createTdWithInputHTML(param) {
        return `
            <td class="customTable__element customTable__element_w117">
                <input
                    type="number"
                    class="customTable__input"
                    min="0"
                    value="0"
                    data-columnLabel="${param}"
                    required
                />
            </td>
        `;
    }

    #init() {
        this.#body = this._root.querySelector("tbody");
        this.#parametersRows = Array.from(this.#body.querySelectorAll("[data-parametersRow]"));
    }

    #getRows(tableBody) {
        return Array.from(tableBody.querySelectorAll("tr"));
    }

    #getRowLabel(row) {
        return row.querySelector("[data-rowLabel]").dataset.rowlabel;
    }

    //#region tmp
    #checkValidity(table) {
        let result = true;

        const rows = this.#getRows(table);

        for (let row of rows) {
            const inputs = this.#getInputs(row);
            for (let input of inputs) {
                if (!this.#checkCorrect(input)) {
                    this.#triggerReportValidity(input);
                    result = false;
                    console.log(result);
                }
            }
        }

        return result;
    }

    #getInputs(row) {
        return Array.from(row.querySelectorAll("input"));
    }

    #checkCorrect(input) {
        return input.validity.valid;
    }

    #triggerReportValidity(inputElement) {
        inputElement.reportValidity();
    }

    //#endregion tmp
}
