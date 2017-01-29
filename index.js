var EventEmitter = require('events').EventEmitter;
var Promise = require("bluebird");

var longpoll = function(app) {

    var _app = app;
    if (!global.express_longpoll_emitters) {
        global.express_longpoll_emitters = {};
    }

    var _newDispatcher = function(url, opts) {
        var dispatcher = new EventEmitter();
        if (opts) {
            if (opts.maxListeners && opts.maxListeners > 0) {
                dispatcher.setMaxListeners(opts.maxListeners);
            }
        }
        global.express_longpoll_emitters[url] = dispatcher;
        return dispatcher;
    };

    var exportObj = {
        create: function(url, opts) {
            return new Promise(function(resolve, reject) {
                if (global.express_longpoll_emitters[url]) {
                    return reject("URL already in use: " + url);
                }
                var dispatcher = _newDispatcher(url, opts);
                _app.get(url, (req, res) => {
                    var sub = function(res) {
                        dispatcher.once('message', function(data) {
                            res.json(data)
                        });
                    }
                    sub(res)
                });
                resolve();
            });
        },
        publish: function(url, data) {
            return new Promise(function(resolve, reject) {
                if (global.express_longpoll_emitters[url]) {
                    global.express_longpoll_emitters[url].emit('message', data);
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
