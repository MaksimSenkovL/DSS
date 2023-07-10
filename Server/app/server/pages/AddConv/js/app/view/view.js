import Controller from "../controller/controller.js";

import SelectSet from "./Elements/SelectSet/SelectSet.js";

import AlternativesTable from "./Elements/AlternativesTable/AlternativesTable.js";

import SaveSetButton from "./Elements/Buttons/SaveSet/SaveSetButton.js";

import AddNewAlternativeForm from "./Elements/AddNewAlternativeForm/AddNewAlternativeForm.js";
import CalculateButton from "./Elements/Buttons/CalculateButton/CalculateButton.js";
import ParametrTable from "./Elements/ParametrsTable/ParametrsTable.js";
import Output from "./Elements/Output/Output.js";
import AddNewColumnToAlternativesTableButton from "./Elements/Buttons/AddNewColumnToAlternativesTableButton/AddNewColumnToAlternativesTableButton.js";
import NewColumnDialog from "./Elements/NewColumnDialog/NewColumnDialog.js";
import NewSetDialog from "./Elements/NewSetDialog/NewSetDialog.js";
import CreateSetButton from "./Elements/Buttons/CreateSetButton/CreateSetButton.js";
import DeleteSetButton from "./Elements/Buttons/DeleteSetButton/DeleteSetButton.js";

export default class View {
    #root;

    #Controller;

    #selectSet;
    #alternativesTable;
    #parametrsTable;

    #addNewColumnToAlternativesTableButton;
    #saveSetsButton;
    #createSetButton;
    #deleteSetButton;
    #calculateButton;

    #addNewAlternativeForm;

    #newColumnDialog;
    #newSetDialog;

    #output;

    constructor(root) {
        this.#root = root;
        this.#Controller = new Controller();

        this.#init();
    }

    recieveData(setsData) {
        this.#Controller.receiveDataForModel(setsData);
    }

    render() {
        const labels = this.#Controller.getSetsLabels();
        const currentSet = this.#Controller.getCurrentSet();

        this.#selectSet.fillSelect(labels);
        this.#selectSet.setValue(currentSet.label);

        this.#alternativesTable.fillTable(currentSet);

        this.#addNewAlternativeForm.fillTable(currentSet.parameters);
        this.#parametrsTable.fillTable(currentSet.parameters);
    }

    renderalternativesTable() {
        const currentSet = this.#Controller.getCurrentSet();

        this.#alternativesTable.fillTable(currentSet);
    }

    // #region test
    show() {
        // this.#selectSet.fillSelect();
        return this.#Controller.getCurrentSet();
    }
    // #endregion test

    #init() {
        this.#selectSet = new SelectSet(document.getElementById("selectSet"));

        this.#alternativesTable = new AlternativesTable(document.getElementById("alternativesTable"));

        this.#addNewColumnToAlternativesTableButton = new AddNewColumnToAlternativesTableButton(
            document.getElementById("addNewColumnToAlternativesTableButton")
        );

        this.#newColumnDialog = new NewColumnDialog(document.getElementById("newColumnDialog"));
        this.#newSetDialog = new NewSetDialog(document.getElementById("newSetDialog"));

        this.#saveSetsButton = new SaveSetButton(document.getElementById("saveSetsButton"));
        this.#createSetButton = new CreateSetButton(document.getElementById("addNewSetButton"));
        this.#deleteSetButton = new DeleteSetButton(document.getElementById("deleteSetButton"));

        this.#addNewAlternativeForm = new AddNewAlternativeForm(document.getElementById("addNewAlternative"));

        this.#parametrsTable = new ParametrTable(document.getElementById("parametrsTable"));

        this.#calculateButton = new CalculateButton(document.getElementById("calculateButton"));

        this.#output = new Output(document.getElementById("output"));

        this.#initEventListeners();
    }

    #initEventListeners() {
        this.#root.addEventListener("selectChange", this.#selectChange.bind(this));

        this.#root.addEventListener("openNewColumnModal", this.#openNewColumnModal.bind(this));

        this.#root.addEventListener("addNewColumn", this.#addNewColumn.bind(this));
        this.#root.addEventListener("deleteColumn", this.#deleteColumn.bind(this));

        this.#root.addEventListener("alternativeParametrChanged", this.#parametrChanged.bind(this));

        this.#root.addEventListener("submitAlternativesForm", this.#submitAlternativesForm.bind(this));

        this.#root.addEventListener("saveSets", this.#saveSets.bind(this));

        //
        this.#root.addEventListener("openNewSetModal", this.#openNewSetModal.bind(this));
        this.#root.addEventListener("addNewSet", this.#addNewSet.bind(this));
        //

        this.#root.addEventListener("deleteSet", this.#deleteSet.bind(this));

        this.#root.addEventListener("calculate", this.#calculateButtonClick.bind(this));
    }

    #selectChange(event) {
        const setLabel = event.detail.label;

        this.#Controller.setCurrentSet(setLabel);

        this.#renderTables();
    }

    #openNewColumnModal(event) {
        this.#newColumnDialog.showModal();
    }

    #openNewSetModal(event) {
        this.#newSetDialog.showModal();
    }

    #addNewSet(event) {
        const label = event.detail.label.trim();

        if (!this.#Controller.createNewSet(label)) {
            alert("Label is already taken!");
            return;
        }
        this.#newSetDialog.closeModal();
        this.render();
    }

    #deleteSet(event) {
        this.#Controller.deleteCurrentSet();
        this.render();
    }

    #addNewColumn(event) {
        if (!this.#Controller.addNewParametr(event.detail.label)) {
            alert("Parametr is already added!");
            return;
        }

        this.#newColumnDialog.closeModal();

        this.#renderTables();
    }

    #deleteColumn(event) {
        console.log(event.detail);
        this.#Controller.deleteParametr(event.detail.label);
        this.#renderTables();
    }

    #parametrChanged(event) {
        this.#Controller.parametrInAlternativeChanged(event.detail);
    }

    #submitAlternativesForm(event) {
        const alternativeInfo = event.detail.data;

        this.#Controller.addAlternativeToCurrentSet(alternativeInfo);

        this.renderalternativesTable();
    }

    #saveSets(e) {
        const sets = this.#Controller.getSets();
        let event = new CustomEvent("saveSetsToLocalStorage", {
            bubbles: true,
            detail: { data: sets },
        });

        this.#root.dispatchEvent(event);
    }

    async #calculateButtonClick() {
        const alternatives = this.#Controller.getCurrentSetWithoutHref();
        const parameters = this.#parametrsTable.getParameters();

        if (!this.#isParametersSetted(parameters)) {
            return;
        }

        if (!this.#isAlternativesMoreThenOne(alternatives)) {
            alert("You must provide at least two alternatives.");
            return;
        }

        const data = {
            alternatives: alternatives,
            parameters: parameters,
        };

        const replyData = await this.#Controller.calculate(data);

        this.#output.render(replyData);
        console.log(replyData);
    }

    #isParametersSetted(params) {
        return Object.keys(params).length !== 0;
    }

    #isAlternativesMoreThenOne(alternatives) {
        return alternatives.data.length > 1;
    }

    #renderTables() {
        const currentSet = this.#Controller.getCurrentSet();

        this.#alternativesTable.fillTable(currentSet);
        this.#addNewAlternativeForm.fillTable(currentSet.parameters);
        this.#parametrsTable.fillTable(currentSet.parameters);
    }
}
