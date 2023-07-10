import View from "./view/view.js";

let parentWindow = undefined;

const root = document.getElementById("methodPage");
const view = new View(root);

window.addEventListener("message", function (event) {
    parentWindow = event.source.window;
    const data = JSON.parse(event.data);

    view.recieveData(data);
    view.render();
});

root.addEventListener("saveSetsToLocalStorage", saveSets);

function saveSets(event) {
    console.log(event.detail.data);
    const data = JSON.stringify(event.detail.data);

    parentWindow.postMessage(data, "*");
}
