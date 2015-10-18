var request = require('supertest');
var app = require('./app');

describe('Requests to the root path', function() {
    it('Returns a 200 status code', function(done) {
        request(app)
            .get('/')
            .expect(200)
            .end(function (error) {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it('Returns an HTML format', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', /html/, done);
    });
});

describe('Listing Categories on /categories', function () {
    it('Returns a 200 status code.', function (done) {
        request(app)
            .get('/categories')
            .expect(200)
            .end(function (error) {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it('Returns JSON format', function (done) {
        request(app)
            .get('/categories')
            .expect('Content-Type', /json/)
            .end(function (error) {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it('Returns initial categories', function (done) {
        request(app)
            .get('/categories')
            .expect(JSON.stringify(['Eating', 'Sleeping', 'Pooping', 'Flooping']),
                done);
    });
});

describe('Creating new cities', function () {
    it('Returns a 201 status code', function (done) {
        request(app)
            .post('/categories')
            .send('name=Hello&description=just+saying+hi')
            .expect(201, done);
    });

    it('Returns the category name', function (done) {
        request(app)
            .post('/categories')
            .send('name=Hello&description=just+saying+hi')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify('Hello'), done);
    });
});