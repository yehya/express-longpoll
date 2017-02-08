var express = require('express');
var app = express();
const longpoll = require("../../index.js")(app, {
    DEBUG: true
});

app.use((req, res, next) => {
    console.log("URL: " + req.url);
    next();
});

// Simple general longpoll
longpoll.create("/poll2");

// This longpoll can publish data to specific users with different ID's
// It requires middleware that places the user ID in req.id
longpoll.create("/poll/:id", (req,res, next) => {
    req.id = req.params.id;
    next();
});

app.get('/publish', function(req, res) {
    
    longpoll.publish("/poll2", {
        text: "Hello world LongPoll 2!"
    });
    
    var userId1 = 1;
    var userId2 = 2;
    
    // publish to req.id = 1
    longpoll.publishToId("/poll/:id", userId1, {
        text: "Published to ID 1!"
    });
    
    // Publish to req.id = 2
    longpoll.publishToId("/poll/:id", userId2, {
        text: "Published to ID 2!"
    });
    
    res.send('Published!');
});

app.listen(8080, function() {
    console.log("Listening on port 8080");
});
