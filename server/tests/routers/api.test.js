const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { app } = require('./../../server');
const { seed } = require('./../../db/seed');
const { User } = require('./../../../models/user');

before(function (done) {
    this.timeout(0);
    seed.seedTestUser(done)
});
before(function (done) {
    this.timeout(0);
    seed.seedTestRoom(done)
});
before(function (done) {
    this.timeout(0);
    seed.seedTestMaintenance(done)
});

let tsu = seed.seedUser[1];
let tru = seed.seedUser[2];
let tiu = seed.seedUser[3];
let userManager = seed.seedUser[4];
let userDeleter = seed.seedUser[5];

describe('/api', () => {

    //! Maintenance

    describe('Maintenance', () => {

        //! GET /maintenance

        describe('GET /maintenance', () => {

            it('authenticated\t\t su\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/maintenance')
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.maintenance.active).toBe(seed.seedMaintenance.active);
                        expect(typeof response.body.maintenance.active).toBe('boolean');
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/maintenance')
                    .set('x-auth', tru.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.maintenance.active).toBe(seed.seedMaintenance.active);
                        expect(typeof response.body.maintenance.active).toBe('boolean');
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/maintenance')
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/maintenance')
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });
        });

        //! PATCH /maintenance

        describe('PATCH /maintenance', () => {

            it('authenticated\t\t su\t\t\t valid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": false
                    })
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.maintenance.active).toBe(false);
                        expect(typeof response.body.maintenance.active).toBe('boolean');
                    })
                    .end(done);
            });

            it('authenticated\t\t su\t\t\t invalid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": 'tomato'
                    })
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(400)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t valid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": false
                    })
                    .set('x-auth', tru.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t invalid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": 'tomato'
                    })
                    .set('x-auth', tru.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t valid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": false
                    })
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t invalid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": 'tomato'
                    })
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t valid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": false
                    })
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t invalid request', (done) => {
                request(app)
                    .patch('/api/maintenance')
                    .send({
                        "active": "tomato"
                    })
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });
        });
    });

    //! Users

    describe('Users', () => {

        //! GET /users

        describe('GET /users', () => {

            it('authenticated\t\t su\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users')
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.users.length).toBe(seed.seedUser.length);
                        expect(typeof response.body.users).toBe('object');
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users')
                    .set('x-auth', tru.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.users.length).toBe(seed.seedUser.length);
                        expect(typeof response.body.users).toBe('object');
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users')
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users')
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });
        });

        //! GET /users/active

        describe('GET /users/active', () => {

            it('authenticated\t\t su\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users/active')
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.users.length).toBe(_.filter(seed.seedUser, { isActive: true }).length);
                        expect(typeof response.body.users).toBe('object');
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users/active')
                    .set('x-auth', tru.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.users.length).toBe(_.filter(seed.seedUser, { isActive: true }).length);
                        expect(typeof response.body.users).toBe('object');
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users/active')
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t valid request', (done) => {
                request(app)
                    .get('/api/users/active')
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });
        });

        //! GET /users/:id

        describe('GET /users/:id', () => {

            it('authenticated\t\t su\t\t\t valid request', (done) => {
                request(app)
                    .get(`/api/users/${seed.seedUser[0]._id.toString()}`)
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.user.username).toBe('admin');
                        expect(typeof response.body.user).toBe('object');
                    })
                    .end(done);
            });

            it('authenticated\t\t su\t\t\t invalid request bad id', (done) => {
                request(app)
                    .get(`/api/users/test`)
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(400)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t su\t\t\t invalid request non-matching id', (done) => {
                request(app)
                    .get(`/api/users/${new ObjectID().toString()}`)
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(404)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t valid request', (done) => {
                request(app)
                    .get(`/api/users/${seed.seedUser[0]._id.toString()}`)
                    .set('x-auth', tru.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(response.body.user.username).toBe('admin');
                        expect(typeof response.body.user).toBe('object');
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t invalid request bad id', (done) => {
                request(app)
                    .get(`/api/users/test`)
                    .set('x-auth', tru.tokens[0].token)
                    .expect(400)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t ru\t\t\t invalid request non-matching id', (done) => {
                request(app)
                    .get(`/api/users/${new ObjectID().toString()}`)
                    .set('x-auth', tru.tokens[0].token)
                    .expect(404)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t valid request', (done) => {
                request(app)
                    .get(`/api/users/${seed.seedUser[0]._id.toString()}`)
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t invalid request bad id', (done) => {
                request(app)
                    .get(`/api/users/test`)
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t invalid request non-matching id', (done) => {
                request(app)
                    .get(`/api/users/${new ObjectID().toString()}`)
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t valid request', (done) => {
                request(app)
                    .get(`/api/users/${seed.seedUser[0]._id.toString()}`)
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t invalid request bad id', (done) => {
                request(app)
                    .get(`/api/users/test`)
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('authenticated\t\t iu\t\t\t invalid request non-matching id', (done) => {
                request(app)
                    .get(`/api/users/${new ObjectID().toString()}`)
                    .set('x-auth', tiu.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t valid request', (done) => {
                request(app)
                    .get(`/api/users/${seed.seedUser[0]._id.toString()}`)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t invalid request bad id', (done) => {
                request(app)
                    .get(`/api/users/test`)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });

            it('unauthenticated\t\t\t\t invalid request non-matching id', (done) => {
                request(app)
                    .get(`/api/users/${new ObjectID().toString()}`)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end(done);
            });
        });

        //! POST /users

        describe('POST /users', () => {

            it('authenticated\t\t su\t\t\t valid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "testSuAddedUser",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "test"
                    })
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(typeof response.body.user).toBe('object');
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findById(res.body.user._id.toString()).then((user) => {
                            expect(user).not.toBeUndefined();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t su\t\t\t invalid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "noUserHere"
                    })
                    .set('x-auth', tsu.tokens[0].token)
                    .expect(400)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'noUserHere' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t authorised\t\t valid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "testUmAddedUser",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "test"
                    })
                    .set('x-auth', userManager.tokens[0].token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect((response) => {
                        expect(typeof response.body.user).toBe('object');
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findById(res.body.user._id.toString()).then((user) => {
                            expect(user).not.toBeUndefined();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t authorised\t\t invalid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "noUserHere"
                    })
                    .set('x-auth', userManager.tokens[0].token)
                    .expect(400)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'noUserHere' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t unauthorised (no)\t valid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "testRuAddedUser",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "test"
                    })
                    .set('x-auth', tru.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'testRuAddedUser' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t unauthorised (no)\t invalid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "noUserHere"
                    })
                    .set('x-auth', tru.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'noUserHere' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t unauthorised (diff)\t valid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "testRuAddedUser",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "test"
                    })
                    .set('x-auth', userDeleter.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'testRuAddedUser' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('authenticated\t\t unauthorised (diff)\t invalid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "noUserHere"
                    })
                    .set('x-auth', userDeleter.tokens[0].token)
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'noUserHere' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('unauthenticated\t\t\t\t valid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "testUnAddedUser",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "test"
                    })
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'testUnAddedUser' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });

            it('unauthenticated\t\t\t\t invalid request', (done) => {
                request(app)
                    .post(`/api/users`)
                    .send({
                        "username": "noUserHere"
                    })
                    .expect(403)
                    .expect((response) => {
                        expect(response.body).toEqual({});
                    })
                    .end((err, res) => {
                        if (err) { return done(err); }
                        User.findOne({ username: 'noUserHere' }).then((user) => {
                            expect(user).toBeNull();
                            done();
                        }).catch((e) => done(e));
                    });
            });
        });
    });
});
