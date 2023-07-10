const path = require("path");

const API = new Map();

API.set("/ElectreIII", path.join(global.__basedir, "methods", "ElectreIII", "main.js"));
API.set("/ElectreI", path.join(global.__basedir, "methods", "ElectreI", "main.js"));

API.set("/AddConv", path.join(global.__basedir, "methods", "AddConv", "main.js"));
API.set("/ImplConv", path.join(global.__basedir, "methods", "ImplConv", "main.js"));

module.exports = API;
