var EventEmitter2 = require('eventemitter2').EventEmitter2;
var Promise = require("bluebird");
var _ = require("lodash");

var longpoll = function(app, opts) {

    // Default Config
    var config = {
        DEBUG: false,
        events: {
            maxListeners: 0 // unlimited
        }
    };

    // Merge options with config
    if (opts) {
        config = _.assign(config, opts);
    }
    
    // For logging messages
    var log = function() {
        if (!config.DEBUG) return;
        var args = Array.prototype.slice.call(arguments, 0);

        args = _.map(args, (n) => {
            if (typeof n !== "string") {
                n = JSON.stringify(n, null, 4);
            }
            return n;
        });

        console.log("[express-longpoll]", args.join(" "));
    }

    var _app = app;
    if (!global.express_longpoll_emitters) {
        global.express_longpoll_emitters = {};
    }

    var _newDispatcher = function(url, opts) {
        
        // Init EventEmitter
        var dispatcher = new EventEmitter2({
            wildcard: true,
            delimiter: "."
        });
        
        // Log on every event emitted
        dispatcher.onAny((event, value) => {
            log("Event emitted:", url + ":", event, value);
        });
        
        if (opts) {
            if (opts.maxListeners && opts.maxListeners > 0) {
                dispatcher.setMaxListeners(opts.maxListeners);
            }
        }
        
        global.express_longpoll_emitters[url] = dispatcher;
        return dispatcher;
    };

    var exportObj = {
        // Has middleware that assigns a req.id to emit events at specific users only
        _createWithId: function(url, middleware, opts) {
            return this._setupListener(url, "longpoll", middleware, opts);
        },

        // method that sets up ID
        use: function(middleware) {
            _app.use(middleware);
        },

        // Create a new longpoll
        create: function(url, middleware, opts) {
            if (typeof middleware === "function") {
                return this._createWithId(url, middleware, opts);
            }
            else {
                opts = middleware;
            }
            return this._setupListener(url, "longpoll", null, opts);
        },
        
        // Publishes to everyone listening to this long poll
        publish: function(url, data) {
            return new Promise(function(resolve, reject) {
                if (global.express_longpoll_emitters[url]) {
                    global.express_longpoll_emitters[url].emit('longpoll.**', data);
                    resolve();
                }
                else {
                    reject("Longpoll with the provided URL does not exist: " + url);
                }
            });
        },
        
        // Pushes data to listeners with an extra ID
        publishToId: function(url, id, data) {
            return this._emit(url, "longpoll." + id, data);
        },
        
        // Setup the longpoll listener in an express .get route
        _setupListener: function(url, event, middleware, opts) {
            if (middleware == null) {
                middleware = (req, res, next) => next();
            }
            return new Promise((resolve, reject) => {

                // Check if longpoll for URL already exists
                if (global.express_longpoll_emitters[url]) {
                    return reject("URL already in use: " + url);
                }

                // Setup new dispatcher for the URL
                var dispatcher = _newDispatcher(url, opts);

                // Setup the GET handler for a longpoll request
                _app.get(url, middleware, (req, res) => {
                    var eventId = "longpoll";

                    // Check if there is an ID associated with the request
                    if (req.id) {
                        // Add the ID to the event listener
                        eventId = eventId + "." + req.id;
                        // Clear all previous events for the ID, we only need one
                        log("Old Events cleared: ", url, eventId);
                        dispatcher.removeAllListeners([eventId]);
                    }

                    // Method that Creates event listener
                    var sub = function(res) {
                        log("Event listener registered: ", req.url + ":", eventId);

                        dispatcher.once(eventId, function(data) {
                            log("Event listener triggered: ", req.url, eventId, "Data: ", data);
                            res.json(data);
                        });
                    }

                    // Create it
                    sub(res);
                });
                resolve();
            });
        },
        
        // Emits an event to an event listener
        _emit: function(url, event, data) {
            return new Promise(function(resolve, reject) {
                if (global.express_longpoll_emitters[url]) {
                    global.express_longpoll_emitters[url].emit(event, data);
                    resolve();
                }
                else {
                    reject("Subscription with the provided URL does not exist: " + url);
                }
            });
        }
        
    }

    return exportObj;
};

module.exports = longpoll;
