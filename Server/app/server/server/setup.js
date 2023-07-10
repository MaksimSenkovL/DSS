const path = require("path");

const __basedir = path.dirname(path.dirname(__dirname));
const __pagesdir = path.join(__basedir, "server", "pages");

global.__basedir = __basedir;
global.__pagesdir = __pagesdir;
