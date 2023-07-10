const m = document.getElementById("m");
let win = window.frames.test;

m.onload = async () => {
    let win = window.frames.test;

    let a = await chrome.storage.sync.get(["test"]);
    a = a.test;
    win.postMessage(a, "*");
};

window.addEventListener("message", function (event) {
    save(event.data);
    console.log(event.data);
});

function save(json) {
    chrome.storage.sync.set({ test: json }).then(() => {});
}
