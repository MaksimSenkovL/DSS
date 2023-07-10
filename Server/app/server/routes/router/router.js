const routes = require("../routes/routes.js");

const router = require("express").Router();

router.get("/", (req, res) => {
    res.sendFile(routes.Pages.get("/ElectreIII").html);
});

router.get("/ElectreI", (req, res) => {
    res.sendFile(routes.Pages.get("/ElectreI").html);
});

router.post("/api/ElectreI", (req, res) => {
    const arr = require(routes.API.get("/ElectreI"))(req.body);

    res.end(JSON.stringify(arr));
});

router.post("/api/ElectreIII", (req, res) => {
    const arr = require(routes.API.get("/ElectreIII"))(req.body);

    res.end(JSON.stringify(arr));
});

router.post("/api/AddConv", (req, res) => {
    const arr = require(routes.API.get("/AddConv"))(req.body);

    res.end(JSON.stringify(arr));
});

router.post("/api/ImplConv", (req, res) => {
    const arr = require(routes.API.get("/ImplConv"))(req.body);

    res.end(JSON.stringify(arr));
});

module.exports = router;
