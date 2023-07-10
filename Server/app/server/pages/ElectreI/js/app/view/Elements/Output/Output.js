import BaseElement from "../BaseElement/BaseElement.js";

export default class Output extends BaseElement {
    constructor(node) {
        super(node);
    }

    render(array) {
        this.clearNode(this._root);
        let HTML = "";

        for (let i = 0; i < array.length; i++) {
            const rank = array[i];

            let tmp = `<div class="customOutput__row">
            <div class="customOutput__rowElement">${i + 1})  </div>`;

            for (let j = 0; j < rank.length; j++) {
                tmp += `<div class="customOutput__rowElement">${rank[j]}</div>`;
            }
            tmp += `</div>`;
            HTML += tmp;
        }
        this._root.insertAdjacentHTML("afterbegin", HTML);
    }
}
