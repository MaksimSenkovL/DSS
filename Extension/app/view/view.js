import Controller from "../controller/controller.js";

import SelectRepository from "./Elements/SelectSet/SelectSet.js";
import ListOfRepositories from "./Elements/ListOfRepositories/ListOfRepositories.js";
import NewSetDialog from "./Elements/NewSetDialog/NewSetDialog.js";
import AddNewSetButton from "./Elements/Buttons/AddNewSet/AddNewSetButton.js";
import DeleteSetButton from "./Elements/Buttons/DeleteSet/DeleteSetButton.js";
import AddNewRepositoryButton from "./Elements/Buttons/AddNewRepository/AddNewRepositoryButtton.js";
import SaveButton from "./Elements/Buttons/SaveButton/SaveButton.js";

export default class View {
    #Controller;

    #extensionElement;

    #selectRepositry;
    #listOfRepositories;

    #addNewSetButton;
    #deleteSetButton;

    #addNewRepositoryButton;

    #saveButton;

    #newSetDialog;

    constructor() {
        this.#Controller = new Controller();

        this.#init();
    }

    async run() {
        await this.#Controller.initModel();

        this.render();
    }

    show() {
        return [this.#selectRepositry, this.#listOfRepositories];
    }

    render() {
        this.fillSetsSelectElement();
        this.fillListOfRepositories();
    }

    renderListOfRepositories() {
        this.fillListOfRepositories();
    }

    fillSetsSelectElement() {
        const sets = this.#Controller.getRepositorySetsLabels();

        this.#selectRepositry.fillSelect(sets);
    }

    fillListOfRepositories() {
        const currentSet = this.#Controller.getCurrentSet();

        console.log("current set is: ", currentSet);

        this.#listOfRepositories.fillList(currentSet.data);
    }

    #init() {
        this.#extensionElement = document.getElementById("extension");

        this.#selectRepositry = new SelectRepository(document.getElementById("selectRepository"));
        this.#addNewSetButton = new AddNewSetButton(document.getElementById("addNewSetButton"));
        this.#deleteSetButton = new DeleteSetButton(document.getElementById("deleteSetButton"));

        this.#listOfRepositories = new ListOfRepositories(document.getElementById("repositoryList"));

        this.#addNewRepositoryButton = new AddNewRepositoryButton(document.getElementById("addButton"));
        this.#saveButton = new SaveButton(document.getElementById("saveButton"));

        this.#newSetDialog = new NewSetDialog(document.getElementById("newSetDialog"));

        this.#initEventListeners();
    }

    #initEventListeners() {
        this.#extensionElement.addEventListener("selectChange", this.#selectChange.bind(this));

        this.#extensionElement.addEventListener("addNewSetButtonClick", this.#addNewSetButtonClick.bind(this));
        this.#extensionElement.addEventListener("deleteSetButtonClick", this.#deleteSetButtonClick.bind(this));

        this.#extensionElement.addEventListener("deleteRepository", this.#deleteRepository.bind(this));

        this.#extensionElement.addEventListener("addNewRepositoryButtonClick", this.#addNewRepository.bind(this));
        this.#extensionElement.addEventListener("save", this.#saveSets.bind(this));

        this.#extensionElement.addEventListener("createSet", this.#createSet.bind(this));
    }

    #selectChange(event) {
        const setLabel = event.detail.label;

        this.#Controller.setCurrentSet(setLabel);
        this.fillListOfRepositories();
    }

    #addNewSetButtonClick(event) {
        this.#newSetDialog.showModal();
    }

    #createSet(event) {
        const label = event.detail.label;
        const labels = this.#Controller.getSetsLabels();

        const isLabelTaken = this.#isLabelTaken(label, labels);

        if (isLabelTaken) {
            alert("Label is already taken");
            return;
        }

        this.#Controller.createNewSetAndSetItCurrent(label);

        this.#newSetDialog.closeModal();

        this.render();
        this.#selectRepositry.setValue(label);
    }

    #isLabelTaken(label, labels) {
        const isFinded = labels.find((element, index, array) => {
            if (label.toLowerCase() === element.toLowerCase()) return true;
        });

        return isFinded ? true : false;
    }

    #deleteSetButtonClick() {
        this.#Controller.deleteCurrentset();
        this.render();
    }

    #deleteRepository(event) {
        console.log(event);

        const repositoryLabel = event.detail.label;

        this.#Controller.deleteRepository(repositoryLabel);

        this.render();
    }

    async #addNewRepository() {
        await this.#Controller.addNewRepository();

        this.renderListOfRepositories();
    }

    #saveSets() {
        this.#Controller.saveSets();
    }
}
