require("./setup.js");

const pid = process.pid;

const { PORT } = require("./config.js");

const express = require("express");
const app = express();

const router = require("../routes/router/router.js");

app.use(express.static(global.__pagesdir));

app.use(express.json({ limit: "10mb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

app.use(router);

app.listen(PORT);
