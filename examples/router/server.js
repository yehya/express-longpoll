var express = require('express');
var app = express();

app.use((req, res, next) => {
    console.log("URL: " + req.url);
    next();
});

app.use("/", require("./routes/poll.js"));

app.listen(8080, function() {
    console.log("Listening on port 8080");
});
