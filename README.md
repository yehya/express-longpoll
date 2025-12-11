<img src="http://i.imgur.com/9xty9ps.png" width="100%"/>

[![Build Status](https://travis-ci.org/yehya/express-longpoll.svg?branch=master)](https://travis-ci.org/yehya/express-longpoll)
[![npm version](https://badge.fury.io/js/express-longpoll.svg)](https://badge.fury.io/js/express-longpoll)

Lightweight long polling module for express.js with **TypeScript support**.

## Features

- 🔄 **Simple API** - Easy to set up and use
- 📡 **Promise-based** - Modern async/await support
- 🎯 **TypeScript** - Full type definitions included
- 🚀 **Production-ready** - Used by 147+ projects
- 🔌 **Express Router** - Works with Express routers
- 🎨 **Flexible** - Publish to specific users or broadcast to all

## Description

Sets up basic long poll with subscribe and publish functionality. Perfect for real-time updates without WebSockets.

## Install

```bash
npm install express-longpoll
```

## Quick Start

### JavaScript

```javascript
const express = require("express");
const app = express();
const longpoll = require("express-longpoll")(app);

// Create endpoint
await longpoll.create("/events");

// Publish data
await longpoll.publish("/events", { message: "Hello!" });
```

### TypeScript

```typescript
import express from "express";
import expressLongPoll from "express-longpoll";

const app = express();
const longpoll = expressLongPoll(app, { DEBUG: true });

await longpoll.create("/events", { maxListeners: 100 });
await longpoll.publish("/events", { message: "Hello!" });
```

## Usage

**Basic initalization**

```javascript
var express = require("express");
var app = express();
var longpoll = require("express-longpoll")(app);
// You can also enable debug flag for debug messages
var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });
```

**Quick-start code**

Server - server.js

```javascript
var express = require("express");
var app = express();
var longpoll = require("express-longpoll")(app);

// Creates app.get("/poll") for the long poll
longpoll.create("/poll");

app.listen(8080, function () {
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
        success: function (data) {
            console.log(data); // { text: "Some data" } -> will be printed in your browser console every 5 seconds
            poll();
        },
        error: function () {
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

longpoll.create("/poll", function (req, res, next) {
    // do something
    next();
});
```

###**longpoll.publish(url, data)**  
 Publishes `data` to all listeners on the `url` provided.

```javascript
var express = require("express");
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
var express = require("express");
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
longpoll
    .create("/poll")
    .then(() => {
        console.log("Created /poll");
    })
    .catch((err) => {
        console.log("Something went wrong!", err);
    });

longpoll
    .publish("/poll", data)
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
var subscribe = function (url, cb) {
    $.ajax({
        method: "GET",
        url: url,
        success: function (data) {
            cb(data);
        },
        complete: function () {
            setTimeout(function () {
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

## Live Demo

Check out the **Collaborative Mouse Tracker** demo in the `examples/` folder - a stunning real-time application showcasing express-longpoll capabilities:

- 🖱️ Real-time cursor tracking across multiple browser tabs

```bash
cd examples/collaborative-mouse-tracker
npm install
npm start
# Open http://localhost:3006 in multiple tabs
```

## API Reference

### `longpoll.create(url, [middleware], [options])`

Creates a long-poll endpoint.

**Options:**

- `maxListeners` (number): Maximum number of listeners to prevent memory leaks. Default: 0 (unlimited)

**Returns:** `Promise<void>`

### `longpoll.publish(url, data)`

Publishes data to all listeners on the endpoint.

**Returns:** `Promise<void>`

### `longpoll.publishToId(url, id, data)`

Publishes data to a specific listener by ID.

**Returns:** `Promise<void>`

## Best Practices

- Set `maxListeners` to prevent memory leaks in production
- Use `DEBUG: true` during development for helpful logs
- Implement proper error handling with `.catch()`
- Consider timeout values based on your use case (typically 30-60 seconds)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

ISC
