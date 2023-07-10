const path = require("path");

const Pages = new Map();

Pages.set("/ElectreI", {
    html: path.join(global.__pagesdir, "ElectreI", "html", "index.html"),
});

Pages.set("/ElectreIII", {
    html: path.join(global.__pagesdir, "ElectreIII", "html", "index.html"),
});

Pages.set("/AddConv", {
    html: path.join(global.__pagesdir, "AddConv", "html", "index.html"),
});

Pages.set("/ImplConv", {
    html: path.join(global.__pagesdir, "ImplConv", "html", "index.html"),
});

module.exports = Pages;
