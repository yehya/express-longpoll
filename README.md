<img src="http://i.imgur.com/9xty9ps.png" width="100%"/>

[![Build Status](https://travis-ci.org/yehya/express-longpoll.svg?branch=master)](https://travis-ci.org/yehya/express-longpoll)
[![npm version](https://badge.fury.io/js/express-longpoll.svg)](https://badge.fury.io/js/express-longpoll)

Lightweight long polling module for express.js

### Description

Sets up basic long poll with subscribe and publish functionality.

### Install

```$ npm install -S express-longpoll ```

### Usage

**Basic initalization**
```javascript
var express = require('express');
var app = express();
var longpoll = require("express-longpoll")(app)
// You can also enable debug flag for debug messages
var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });
```

**Quick-start code**  

Server - server.js
```javascript
var express = require('express');
var app = express();
var longpoll = require("express-longpoll")(app);

// Creates app.get("/poll") for the long poll
longpoll.create("/poll");

app.listen(8080, function() {
    console.log("Listening on port 8080");
});

var data = { text: "Some data" };

// Publishes data to all clients long polling /poll endpoint
// You need to call this AFTER you make a GET request to /poll
longpoll.publish("/poll", data);

// Publish every 5 seconds
setInterval(function () { 
    longpoll.publish("/poll", data);
}, 5000);
```

Client - index.js (with jQuery)
```javascript
var poll = function () {
    $.ajax({
       url: "localhost:8080/poll",
       success: function(data){
           console.log(data); // { text: "Some data" } -> will be printed in your browser console every 5 seconds
           poll();
       },
       error: function() {
           poll();
       },
       timeout: 30000 // 30 seconds
    });
};

// Make sure to call it once first,
poll();
```

###**longpoll.create(url, [options])**  
  Sets up an express endpoint using the URL provided.

```javascript
var longpoll = require("express-longpoll")(app);

longpoll.create("/poll");
longpoll.create("/poll2", { maxListeners: 100 }); // set max listeners
```

###**longpoll.create(url, middleware, [options])**  
  Set up an express endpoint using the URL provided, and use middleware.
```javascript
var longpoll = require("express-longpoll")(app);

longpoll.create("/poll", function (req,res,next) {
    // do something
    next();
});
```

###**longpoll.publish(url, data)**  
  Publishes ```data``` to all listeners on the ```url``` provided.

```javascript
var express = require('express');
var app = express();
var longpoll = require("express-longpoll")(app);

longpoll.create("/poll");

longpoll.publish("/poll", {});
longpoll.publish("/poll", { hello: "Hello World!" });
longpoll.publish("/poll", jsonData);
```

###**longpoll.publishToId(url, id, data)**  
Publish data to a specific request. See [the basic example](./examples/basic) on how to use this effectively.

## Works with Routers
```javascript
var express = require('express');
var router = express.Router();
// with router
var longpoll = require("express-longpoll")(router);

longpoll.create("/routerpoll");

router.get("/", (req, res) => {
    longpoll.publish("/routerpoll", {
        text: "Some data"
    });
    res.send("Sent data!");
});

module.exports = router;
```

## Can publish to any endpoint, from anywhere.

**server.js** - create here
```javascript
var longpoll = require("express-longpoll")(app);
longpoll.create("/poll");
```
**route.js** - use here
```javascript
var longpoll = require("express-longpoll")(router);
// Can publish to any endpoint
longpoll.publish("/poll");
```

## Using Promises

```javascript
longpoll.create("/poll")
  .then(() => {
    console.log("Created /poll");
  })
  .catch((err) => {
    console.log("Something went wrong!", err);
  });
  
longpoll.publish("/poll", data)
  .then(() => {
    console.log("Published to /poll:", data);
  })
  .catch((err) => {
    console.log("Something went wrong!", err);
  });
```

## Sample clientside code to subscribe to the longpoll

###Client using jQuery
```javascript
var subscribe = function(url, cb) {
        $.ajax({
            method: 'GET',
            url: url,
            success: function(data) {
                cb(data);
            },
            complete: function() {
                setTimeout(function() {
                    subscribe(url, cb);
                }, 1000);
            },
            timeout: 30000
        });
    };
    
subscribe("/poll", function (data) {
  console.log("Data:", data);
});

subscribe("/poll2", function (data) {
  console.log("Data:", data);
});
```
