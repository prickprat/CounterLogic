var request = require('supertest');
var server = require('./server');

var redis = require('redis');
var client = redis.createClient();

client.select((process.env.NODE_ENV || 'test').length);
client.flushdb();

describe('Requests to the root path', function() {
    it('Returns a 200 status code', function(done) {
        request(server)
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
        request(server)
            .get('/')
            .expect('Content-Type', /html/, done);
    });
});

describe('Listing Categories on /categories', function () {
    before(function() {
        client.sadd('categories', 'Poop');
        client.hmset('category:Poop', ['name', 'Poop', 'description', 'smells like shit', 'count', 100]);
    });

    after(function() {
        client.flushdb();
    });

    it('Returns a 200 status code.', function (done) {
        request(server)
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
        request(server)
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
        request(server)
            .get('/categories')
            .expect(JSON.stringify([
                {
                    name: 'Poop',
                    description: 'smells like shit',
                    count: '100'
                }
            ]), done);
    });
});

describe('Creating new categories', function () {
    it('Returns a 201 status code', function (done) {
        request(server)
            .post('/categories')
            .send('name=Hello&description=just+saying+hi')
            .expect(201, done);
    });

    it('Returns the category name', function (done) {
        request(server)
            .post('/categories')
            .send('name=Hello&description=just+saying+hi')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify({'name': 'Hello', 'count':0}), done);
    });

    it('validates category names ', function (done) {
        request(server)
            .post('/categories')
            .send('name=&description=just+saying+hi')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(JSON.stringify('Invalid Category Name'), done);
    });

    it('validates category descriptions', function(done) {
        request(server)
            .post('/categories')
            .send('name=helloo&description=')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(JSON.stringify('Invalid Description'), done);
    });

    it('instantiates a counter at 0', function(done) {
        request(server)
            .post('/categories')
            .send('name=Hari&description=ungabunga')
            .expect(201)
            .expect(JSON.stringify({'name': 'Hari', 'count': 0}), done);

    });
});

describe('Deleting Categories', function() {
    before(function() {
        client.sadd('categories', 'Poop');
        client.hmset('category:Poop', ['name', 'Poop', 'description', 'smells like shit', 'count', 0]);
    });

    after(function() {
        client.flushdb();
    });

    it('Returns a 204 status code', function(done) {
        request(server)
            .delete('/categories/Poop')
            .expect(204, done);
    });

    it('Returns a 400 code when there is nothing to delete', function(done) {
        request(server)
            .delete('/categories/Nothing')
            .expect(400, done);
    });
});

describe('Shows Category info', function() {

    before(function() {
        client.sadd('categories', 'Poop');
        client.hmset('category:Poop', ['name', 'Poop', 'description', 'smells like shit', 'count', 0]);
    });

    after(function() {
        client.flushdb();
    });

    it('returns 200 status code', function(done) {
        request(server)
            .get('/categories/Poop')
            .expect(200, done);
    });

    it('returns html format', function(done) {
        request(server)
            .get('/categories/Poop')
            .expect('Content-Type', /html/, done);
    });

    it('returns information for given category', function(done) {
        request(server)
            .get('/categories/Poop')
            .expect(/smells/, done);
    });
});