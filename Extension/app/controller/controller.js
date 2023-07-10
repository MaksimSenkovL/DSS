import Model from "../model/model.js";
import GitHubAPIRequester from "../services/GitHubAPIRequester/GitHubAPIRequester.js";
import Tab from "../services/Tab/Tab.js";

export default class Controller {
    #Model;
    constructor() {
        this.#Model = new Model();
    }

    async initModel() {
        await this.#Model.init();
    }

    getCurrentSet() {
        return this.#Model.getCurrentSet();
    }

    setCurrentSet(label) {
        this.#Model.setCurrentSet(label);
    }

    deleteCurrentset() {
        this.#Model.deleteCurrentSet();
    }

    createNewSet(label) {
        this.#Model.createNewSet(label);
    }

    createNewSetAndSetItCurrent(label) {
        this.#Model.createNewSetAndSetItCurrent(label);
    }

    getSetsLabels() {
        return this.#Model.getSetsLabels();
    }

    getRepositorySetsLabels() {
        return this.#Model.getRepositorySetsLabels();
    }

    deleteRepository(label) {
        this.#Model.deleteRepository(label);
    }

    saveSets() {
        this.#Model.saveSets();
    }

    async addNewRepository() {
        const currentTabURL = await Tab.getCurrentTabURL();

        if (!Tab.isCurrentTabURLEqualsGitHubURL(currentTabURL)) {
            return;
        }

        const repositoryInfo = await GitHubAPIRequester.getRepositoryInfo(currentTabURL);

        if (this.#isRepositoryAlreadyAdded(repositoryInfo.label)) {
            return;
        }

        this.#addRepositoryToCurrentSet(repositoryInfo);
    }

    #isRepositoryAlreadyAdded(label) {
        const currentSet = this.#Model.getCurrentSet();

        const isLabelExistInCurrentSetRepositories = currentSet.data.find((element, index, array) => {
            return element.label.toLowerCase() === label.toLowerCase();
        });

        return isLabelExistInCurrentSetRepositories ? true : false;
    }

    #addRepositoryToCurrentSet(repositoryInfo) {
        this.#Model.addRepositoryToCurrentSet(repositoryInfo);
    }
}
