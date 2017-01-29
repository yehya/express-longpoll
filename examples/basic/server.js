var express = require('express');
var app = express();
const longpoll = require("../../index.js")(app);

app.use((req, res, next) => {
    console.log("URL: " + req.url);
    next();
});

longpoll.create("/poll");
longpoll.create("/poll2");

app.get('/', function(req, res) {
    longpoll.publish("/poll", {
        text: "Hello world LongPoll!"
    });
    longpoll.publish("/poll2", {
        text: "Hello world LongPoll 2!"
    });
    res.send('Hello World!')
});

app.listen(8080, function() {
    console.log("Listening on port 8080");
});
