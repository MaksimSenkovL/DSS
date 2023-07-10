export default class Model {
    constructor() {}

    #repositorySets;

    #currentSet;

    //TODO: какой из методов использутся? Init не использвуется?????
    async init(setsData) {
        this.#repositorySets = setsData;

        this.#setFirstSetOfRepositoriesAsCurrent();
    }

    receiveData(setsData) {
        this.#repositorySets = setsData;
        this.#setFirstSetOfRepositoriesAsCurrent();
    }

    getCurrentSet() {
        return this.#currentSet;
    }

    getCurrentSetWithoutHref() {
        const clone = structuredClone(this.#currentSet);

        const data = clone.data;
        for (let filed of data) {
            delete filed.href;
        }

        return clone;
    }

    getSets() {
        return this.#repositorySets;
    }

    getSetsLabels() {
        return Object.keys(this.#repositorySets);
    }

    setCurrentSet(label) {
        if (typeof label === "undefined") {
            this.#currentSet = {
                label: "",
                type: "tmp",
                data: [],
                parameters: ["label"],
            };
        } else {
            this.#currentSet = this.#repositorySets[label];
        }
    }

    addToCurrentSet(alternativeInfo) {
        this.#currentSet.data.push(alternativeInfo);
    }

    createNewSet(label) {
        const set = {
            label: label,
            type: "custom",
            data: [],
            parameters: ["label"],
        };

        this.#repositorySets[label] = set;
        this.setCurrentSet(label);
    }

    deleteCurrentSet() {
        const label = this.#currentSet.label;

        this.#deleteSet(label);

        this.setCurrentSet(this.getSetsLabels()[0]);
    }

    #deleteSet(label) {
        delete this.#repositorySets[label];
    }

    #setFirstSetOfRepositoriesAsCurrent() {
        const label = Object.keys(this.#repositorySets)[0];
        this.setCurrentSet(label);
    }
}
