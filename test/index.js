process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('./server');
var should = chai.should();

chai.use(chaiHttp);

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
    
    beforeEach((done) => {
        //Before each test
        done();
    });

    describe('longpoll.create(url, data)', () => {
        it('should create a .get express endpoint', (done) => {
            // console.log(JSON.stringify(server._router.stack, null, 4));
            server._router.stack.forEach((val, indx) => {
                try {
                    if (val.route.path === "/poll") {
                        done();
                    }
                } catch (error) {
                    return;
                }
            })
        });
    });

    describe('longpoll.publish(url, data)', () => {
        it('should publish data to all requests listening on a url', (done) => {
            var numRequestsCompleted = 0;
            
            // Create requests
            for (var i = 0; i < 10; i += 1) {
                chai.request(server)
                    .get('/poll')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.equal("POLL");
                        numRequestsCompleted++;
                    });
            }
            
            // Publish to all requests only once
            setTimeout(() => {
                longpoll.publish("/poll", "POLL");
            }, 1000);
            
            // Check if all requests completed
            var interv = setInterval(() => {
                if (numRequestsCompleted === 10) {
                    done();
                    clearInterval(interv);
                }
            }, 500);
        });
    });

});
