import Model from "../model/model.js";

export default class Controller {
    #Model;

    constructor() {
        this.#Model = new Model();
    }

    receiveDataForModel(setsData) {
        this.#Model.receiveData(setsData);
    }

    getCurrentSet() {
        return this.#Model.getCurrentSet();
    }

    setCurrentSet(label) {
        this.#Model.setCurrentSet(label);
    }

    addAlternativeToCurrentSet(alternativeInfo) {
        if (this.#isAlternativeAlreadyAdded(alternativeInfo.label)) {
            return;
        }

        this.#Model.addToCurrentSet(alternativeInfo);
    }

    addNewParametr(label) {
        const currentSet = this.#Model.getCurrentSet();

        if (this.#isParametrAlreadyAdded(label, currentSet)) {
            return false;
        }

        this.#addNewParametr(label, currentSet);
        console.log(this.#Model.getCurrentSet());
        return true;
    }

    deleteParametr(label) {
        const currentSet = this.#Model.getCurrentSet();

        for (let alternative of currentSet.data) {
            delete alternative[label];
        }

        const index = currentSet.parameters.indexOf(label);
        currentSet.parameters.splice(index, 1);

        console.log(currentSet);
    }

    createNewSet(label) {
        if (this.#isSetAlreadyExist(label)) {
            return false;
        }

        this.#Model.createNewSet(label);
        return true;
    }

    deleteCurrentSet() {
        this.#Model.deleteCurrentSet();
    }

    parametrInAlternativeChanged(data) {
        const currentSet = this.#Model.getCurrentSet();

        const targetAlternative = currentSet.data.find((alternative) => {
            return alternative.label === data.altLabel;
        });

        targetAlternative[data.paramLabel] = data.value;
    }

    getSetsLabels() {
        return this.#Model.getSetsLabels();
    }

    getSets() {
        return this.#Model.getSets();
    }

    getCurrentSetWithoutHref() {
        return this.#Model.getCurrentSetWithoutHref();
    }

    async calculate(data) {
        console.log(data);
        let rep = await fetch("http://localhost:8800/api/ImplConv", {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "post",
            body: JSON.stringify(data),
        });
        rep = await rep.json();
        return rep;
    }

    #isAlternativeAlreadyAdded(label) {
        const currentSet = this.#Model.getCurrentSet();

        const isLabelExistInCurrentSet = currentSet.data.find((element, index, array) => {
            return element.label.toLowerCase() === label.toLowerCase();
        });

        return isLabelExistInCurrentSet ? true : false;
    }

    #isParametrAlreadyAdded(label, set) {
        const isParametrExistInCurrentSet = set.data.find((element, index, array) => {
            return label.toLowerCase() in element;
        });

        return isParametrExistInCurrentSet ? true : false;
    }

    #isSetAlreadyExist(label) {
        const labels = this.#Model.getSetsLabels();
        return labels.includes(label.toLowerCase());
    }

    #addNewParametr(label, set) {
        set.parameters.push(label);

        for (let elemenet of set.data) {
            elemenet[label] = "0";
        }
    }
}
