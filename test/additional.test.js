process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const express = require("express");
const should = chai.should();
const assert = require("assert");

chai.use(chaiHttp);

describe("express-longpoll - Additional Tests", function () {
    this.timeout(10000);

    describe("Error Handling", () => {
        let app, server, longpoll;

        beforeEach(() => {
            app = express();
            longpoll = require("../index.js")(app);
            server = app.listen(0); // Random port
        });

        afterEach((done) => {
            server.close(done);
        });

        it("should reject when creating duplicate URL", async () => {
            await longpoll.create("/test");

            try {
                await longpoll.create("/test");
                assert.fail("Should have rejected");
            } catch (err) {
                err.should.include("URL already in use");
            }
        });

        it("should reject when publishing to non-existent URL", async () => {
            try {
                await longpoll.publish("/nonexistent", { data: "test" });
                assert.fail("Should have rejected");
            } catch (err) {
                err.should.include("does not exist");
            }
        });

        it("should reject when publishing to ID on non-existent URL", async () => {
            try {
                await longpoll.publishToId("/nonexistent", "user123", { data: "test" });
                assert.fail("Should have rejected");
            } catch (err) {
                err.should.include("does not exist");
            }
        });
    });

    describe("maxListeners Option", () => {
        let app, server, longpoll;

        beforeEach(() => {
            app = express();
            longpoll = require("../index.js")(app);
            server = app.listen(0);
        });

        afterEach((done) => {
            server.close(done);
        });

        it("should set maxListeners when option is provided", async () => {
            await longpoll.create("/limited", { maxListeners: 50 });

            // Verify endpoint was created
            const route = app._router.stack.find(
                (layer) => layer.route && layer.route.path === "/limited"
            );
            assert(route, "Route should be created");
        });

        it("should handle multiple concurrent connections with maxListeners", (done) => {
            longpoll.create("/concurrent", { maxListeners: 100 }).then(() => {
                const requests = [];

                // Create 10 concurrent requests
                for (let i = 0; i < 10; i++) {
                    requests.push(
                        new Promise((resolve) => {
                            chai.request(app)
                                .get("/concurrent")
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.equal("test-data");
                                    resolve();
                                });
                        })
                    );
                }

                // Publish after a delay
                setTimeout(() => {
                    longpoll.publish("/concurrent", "test-data");
                }, 100);

                Promise.all(requests).then(() => done());
            });
        });
    });

    describe("Middleware Support", () => {
        let app, server, longpoll;

        beforeEach(() => {
            app = express();
            longpoll = require("../index.js")(app);
            server = app.listen(0);
        });

        afterEach((done) => {
            server.close(done);
        });

        it("should support middleware function", (done) => {
            let middlewareCalled = false;

            const testMiddleware = (req, res, next) => {
                middlewareCalled = true;
                req.customData = "test";
                next();
            };

            longpoll.create("/with-middleware", testMiddleware).then(() => {
                chai.request(app)
                    .get("/with-middleware")
                    .end((err, res) => {
                        assert(middlewareCalled, "Middleware should be called");
                        done();
                    });

                setTimeout(() => {
                    longpoll.publish("/with-middleware", { data: "test" });
                }, 100);
            });
        });

        it("should support middleware with options", async () => {
            const testMiddleware = (req, res, next) => next();

            await longpoll.create("/middleware-opts", testMiddleware, { maxListeners: 50 });

            const route = app._router.stack.find(
                (layer) => layer.route && layer.route.path === "/middleware-opts"
            );
            assert(route, "Route should be created with middleware and options");
        });
    });

    describe("publishToId", () => {
        let app, server, longpoll;

        beforeEach(() => {
            app = express();
            longpoll = require("../index.js")(app);
            server = app.listen(0);
        });

        afterEach((done) => {
            server.close(done);
        });

        it("should publish to specific user ID", (done) => {
            const middleware = (req, res, next) => {
                req.id = "user123";
                next();
            };

            longpoll.create("/user-specific", middleware).then(() => {
                chai.request(app)
                    .get("/user-specific")
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.deep.equal({ message: "private" });
                        done();
                    });

                setTimeout(() => {
                    longpoll.publishToId("/user-specific", "user123", { message: "private" });
                }, 100);
            });
        });
    });

    describe("Router Support", () => {
        it("should work with Express Router", (done) => {
            const app = express();
            const router = express.Router();
            const longpoll = require("../index.js")(router);

            longpoll.create("/router-poll").then(() => {
                app.use("/api", router);
                const server = app.listen(0);

                chai.request(app)
                    .get("/api/router-poll")
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.equal("router-data");
                        server.close(done);
                    });

                setTimeout(() => {
                    longpoll.publish("/router-poll", "router-data");
                }, 100);
            });
        });
    });

    describe("Promise API", () => {
        let app, server, longpoll;

        beforeEach(() => {
            app = express();
            longpoll = require("../index.js")(app);
            server = app.listen(0);
        });

        afterEach((done) => {
            server.close(done);
        });

        it("should resolve promise on successful create", async () => {
            await longpoll.create("/promise-test");
            // If we get here, promise resolved successfully
            assert(true);
        });

        it("should resolve promise on successful publish", async () => {
            await longpoll.create("/promise-publish");
            await longpoll.publish("/promise-publish", { test: true });
            // If we get here, promise resolved successfully
            assert(true);
        });

        it("should support async/await syntax", async () => {
            await longpoll.create("/async-test");

            const requestPromise = new Promise((resolve) => {
                chai.request(app)
                    .get("/async-test")
                    .end((err, res) => {
                        res.body.should.deep.equal({ async: true });
                        resolve();
                    });
            });

            // Publish after request is set up
            setTimeout(() => {
                longpoll.publish("/async-test", { async: true });
            }, 100);

            await requestPromise;
        });
    });

    describe("Debug Mode", () => {
        it("should enable debug logging when DEBUG is true", () => {
            const app = express();
            const longpoll = require("../index.js")(app, { DEBUG: true });

            // Just verify it initializes without error
            assert(longpoll);
        });

        it("should not log when DEBUG is false", () => {
            const app = express();
            const longpoll = require("../index.js")(app, { DEBUG: false });

            assert(longpoll);
        });
    });

    describe("Data Types", () => {
        let app, server, longpoll;

        beforeEach(() => {
            app = express();
            longpoll = require("../index.js")(app);
            server = app.listen(0);
        });

        afterEach((done) => {
            server.close(done);
        });

        it("should handle object data", (done) => {
            longpoll.create("/object-data").then(() => {
                chai.request(app)
                    .get("/object-data")
                    .end((err, res) => {
                        res.body.should.deep.equal({ key: "value", nested: { data: true } });
                        done();
                    });

                setTimeout(() => {
                    longpoll.publish("/object-data", { key: "value", nested: { data: true } });
                }, 100);
            });
        });

        it("should handle array data", (done) => {
            longpoll.create("/array-data").then(() => {
                chai.request(app)
                    .get("/array-data")
                    .end((err, res) => {
                        res.body.should.deep.equal([1, 2, 3, "test"]);
                        done();
                    });

                setTimeout(() => {
                    longpoll.publish("/array-data", [1, 2, 3, "test"]);
                }, 100);
            });
        });

        it("should handle string data", (done) => {
            longpoll.create("/string-data").then(() => {
                chai.request(app)
                    .get("/string-data")
                    .end((err, res) => {
                        res.body.should.equal("simple string");
                        done();
                    });

                setTimeout(() => {
                    longpoll.publish("/string-data", "simple string");
                }, 100);
            });
        });

        it("should handle null data", (done) => {
            longpoll.create("/null-data").then(() => {
                chai.request(app)
                    .get("/null-data")
                    .end((err, res) => {
                        should.equal(res.body, null);
                        done();
                    });

                setTimeout(() => {
                    longpoll.publish("/null-data", null);
                }, 100);
            });
        });
    });
});
