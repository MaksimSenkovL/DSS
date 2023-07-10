export default class Model {
    #repositorySets;

    #currentSet;

    #tmpObj = {
        shindows: {
            label: "shindows",
            type: "custom",
            data: [
                {
                    f1: 5,
                    f2: 2274,
                    label: "karma",
                    f4: 15540,
                    f5: 445,
                },
                {
                    f1: 5,
                    f2: 2274,
                    label: "NightwatchJS",
                    f4: 15540,
                    f5: 445,
                },
            ],
            parameters: ["label", "f2", "f4", "f5", "f1"],
        },
        testing: {
            label: "testing",
            type: "github",
            data: [
                {
                    contributors: 5,
                    forks: 2274,
                    label: "TEST",
                    stars: 15540,
                    watch: 445,
                    href: "https://github.com/jasmine/jasmine",
                },
                {
                    contributors: 5,
                    forks: 2274,
                    label: "jasmine",
                    stars: 15540,
                    watch: 445,
                    href: "https://github.com/jasmine/jasmine",
                },
            ],
            parameters: ["label", "forks", "stars", "watch", "contributors", "href"],
        },
        gaming: {
            label: "gaming",
            type: "github",
            data: [
                {
                    contributors: 5,
                    forks: 2274,
                    label: "karma",
                    stars: 15540,
                    watch: 445,
                    href: "https://github.com/jasmine/jasmine",
                },
                {
                    contributors: 5,
                    forks: 2274,
                    label: "NightwatchJS",
                    stars: 15540,
                    watch: 445,
                    href: "https://github.com/jasmine/jasmine",
                },
            ],
            parameters: ["label", "forks", "stars", "watch", "contributors", "href"],
        },
        widnows: {
            label: "widnows",
            type: "custom",
            data: [
                {
                    f1: 5,
                    f2: 2274,
                    label: "karma",
                    f4: 15540,
                    f5: 445,
                },
                {
                    f1: 5,
                    f2: 2274,
                    label: "NightwatchJS",
                    f4: 15540,
                    f5: 445,
                },
            ],
            parameters: ["label", "f2", "f4", "f5", "f1"],
        },
    };

    constructor() {
        // this.newLocal();
    }

    async init() {
        await this.#setSetsOfRepositories();

        this.#setFirstSetOfRepositoriesAsCurrent();
    }

    // TODO: Это просто метод для помещения
    // #region TMP
    newLocal() {
        this.#saveToLocalStorage(this.#tmpObj);
    }
    // #endregion TMP

    getSetsLabels() {
        return Object.keys(this.#repositorySets);
    }

    getRepositorySetsLabels() {
        const labels = [];

        for (let alternative in this.#repositorySets) {
            if (this.#repositorySets[alternative].type === "github") {
                labels.push(this.#repositorySets[alternative].label);
            }
        }

        return labels;
    }

    setCurrentSet(label) {
        if (typeof label === "undefined") {
            this.#currentSet = {
                label: "",
                type: "tmp",
                data: [],
                parameters: [],
            };
        } else {
            this.#currentSet = this.#repositorySets[label];
        }
    }

    getCurrentSet() {
        if (this.#currentSet.type !== "github") {
            return {
                label: "",
                type: "tmp",
                data: [],
                parameters: [],
            };
        }
        return this.#currentSet;
    }

    deleteSet(label) {
        delete this.#repositorySets[label];
    }

    addRepositoryToCurrentSet(repostioryInfo) {
        this.#currentSet.data.push(repostioryInfo);
    }

    deleteRepository(label) {
        const index = this.#currentSet.data.findIndex((a) => Object.keys(a)[0] === label);
        this.#currentSet.data.splice(index, 1);
    }

    deleteCurrentSet() {
        const label = this.#currentSet.label;

        this.deleteSet(label);

        this.setCurrentSet(this.getRepositorySetsLabels()[0]);
    }

    createNewSet(label) {
        this.#repositorySets[label] = {
            label: label,
            type: "github",
            data: [],
            parameters: ["label", "forks", "stars", "watch", "contributors", "href"],
        };
    }

    createNewSetAndSetItCurrent(label) {
        this.createNewSet(label);
        this.setCurrentSet(label);
    }

    saveSets() {
        this.#saveToLocalStorage(this.#repositorySets);
    }

    async #setSetsOfRepositories() {
        // TODO: Проверить на нул
        //TODO: Начальное значение при первом запуске.
        let sets = await this.#getRepositorySetsFromLocalStorage();

        if (typeof sets === "undefined") {
            this.#repositorySets = {
                Set: [{}],
            };
            return;
        }

        this.#repositorySets = JSON.parse(sets);
    }

    #setFirstSetOfRepositoriesAsCurrent() {
        // const label = Object.keys(this.#repositorySets)[0];
        const labels = this.getRepositorySetsLabels();

        if (labels.length === 0) {
            const tmpObj = {
                label: "",
                type: "tmp",
                data: [],
                parameters: [],
            };
            this.setCurrentSet(tmpObj);
        } else {
            this.setCurrentSet(labels[0]);
        }
    }

    #saveToLocalStorage(obj) {
        let json = JSON.stringify(obj);

        chrome.storage.sync.set({ test: json }).then(() => {
            // console.log("Value is set to " + json);
        });
    }

    async #getRepositorySetsFromLocalStorage() {
        let a = await chrome.storage.sync.get(["test"]);

        return a.test;
    }
}
