import BaseElement from "../BaseElement/BaseElement.js";

export default class ListOfRepositories extends BaseElement {
    constructor(node) {
        super(node);

        this.#initEventListeners();
    }

    fillList(arrayCurrentSet) {
        this.removeChildrens(this._root);

        // let HTML = arrayCurrentSet.reduce((sum, current) => {
        //     return sum + this.#createListElementHTML(current);
        // }, "");
        console.log("DADADAD", arrayCurrentSet);
        let HTML = "";
        for (let alternative of arrayCurrentSet) {
            HTML += this.#createListElementHTML(alternative);
        }

        this._root.insertAdjacentHTML("afterbegin", HTML);
    }

    #createListElementHTML(repository) {
        return `
            <li class="repository">
                <a class="repositoryLabel" href="${
                    repository.href ? repository.href : "https://github.com/"
                }" target="_blank" data-label="${repository.label}">${repository.label}</a>
                <button class="deleteRepositoryButton">&times;</button>
            </li>
        `;
    }

    #initEventListeners() {
        this._root.addEventListener("click", this.#deleteRepository.bind(this));
    }

    #deleteRepository(ev) {
        if (ev.target.tagName !== "BUTTON") {
            return;
        }

        const repositoryLabel = ev.target.previousElementSibling.dataset.label;

        const event = new CustomEvent("deleteRepository", {
            bubbles: true,
            detail: { label: repositoryLabel },
        });

        this._root.dispatchEvent(event);
    }
}
