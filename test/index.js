process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiUserTwo = require('chai');
var chaiHttp = require('chai-http');
var chaiHttpTwo = require('chai-http');
var testServer = require('./server');
var should = chai.should();
var assert = require('assert');

chai.use(chaiHttp);
chaiUserTwo.use(chaiHttpTwo);

var server = testServer.app;
var appServer = testServer.server;


var longpoll = require("../index.js")(server);

describe('express-longpoll', function () {
    
    // Set timeout
    this.timeout(10000);
    
    // before all tests
    before((done) => {
        // Create longpoll
        longpoll.create("/poll");
        done();
    });

    after((done) => {
        // shutdown server
        done();
        appServer.close();
    });

    beforeEach((done) => {
        //Before each test
        done();
    });

    describe('longpoll.create(url, data)', () => {
        it('should create a .get express endpoint', (done) => {
            //console.log(JSON.stringify(server._router.stack, null, 4));
            server._router.stack.forEach((val, indx) => {
                if (typeof val.route !== "undefined") {
                    if (typeof val.route.path !== "undefined") {
                        assert.equal(val.route.path, "/poll");
                        done();
                    }
                }
            });
        });
    });

    describe('longpoll.publish(url, data)', () => {
        it('should publish data to all requests listening on a url', (done) => {

            var requestPoll = function (pollCount) {
                chai.request(server)
                    .get('/poll')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.equal("POLL-"+pollCount);
                        //console.log(res.body);
                        if (pollCount<10){
                            requestPoll(++pollCount);
                        } else {
                            done();
                        }
                    });
            };

            // Create request chain
            requestPoll(0);
            
            // Publish to all requests only once
            var pollId = 0;
            var pubInterval = setInterval(() => {
                longpoll.publish("/poll", "POLL-"+pollId);
                pollId++;
                if (pollId > 10) {
                    clearInterval(pubInterval);
                }
            }, 200);

        });
    });

    describe('longpoll.publish(url, data)', () => {
        it('should publish data to all clients requests listening on a url', (done) => {
            var usersDone = 2;

            var requestPoll = function (pollCount) {

                if (pollCount === 10 || usersDone !== 2) {
                    return;
                } else {
                    pollCount++;
                    usersDone = 0;
                }

                // user 1
                chai.request(server)
                    .get('/poll')
                    .end((err, res) => {
                        // console.log("USER 1: "+res.body);
                        res.should.have.status(200);
                        res.body.should.equal("POLL-"+pollCount);
                        usersDone++;
                        requestPoll(pollCount);
                    });

                // user 2
                chaiUserTwo.request(server)
                    .get('/poll')
                    .end((err, res) => {
                        // console.log("USER 2: "+res.body);
                        res.should.have.status(200);
                        res.body.should.equal("POLL-"+pollCount);
                        usersDone++;
                        requestPoll(pollCount);
                    });
            };

            // Create request chain
            requestPoll(-1);

            // Publish to all requests only once
            var pollId = 0;
            var pubInterval = setInterval(() => {
                longpoll.publish("/poll", "POLL-"+pollId);
                pollId++;
                if (pollId > 10) {
                    clearInterval(pubInterval);
                    done();
                }
            }, 200);

        });
    });

});
