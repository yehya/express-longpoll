var express = require('express');
var router = express.Router();

// Can use routers as well
const longpoll = require("../../../index.js")(router);

longpoll.create("/routerpoll");

router.get("/", (req, res) => {
    longpoll.publish("/routerpoll", {
        text: "Some data"
    });
    res.send("Sent data!");
});

module.exports = router;