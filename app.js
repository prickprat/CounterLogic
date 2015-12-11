/*jshint strict:false */
/*jslint node: true */

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });


//Redis COnnectiion
var redis = require('redis');
var redisClient;
if (process.env.REDISTOGO_URL) {
    var rtg = require("url").parse(process.env.REDISTOGO_URL);
    redisClient = redis.createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(":")[1]);
} else {
    redisClient = redis.createClient();
    redisClient.select((process.env.NODE_ENV || 'development').length);
}

//End Redis Connection

//Format the category name to be leading Uppercase
function parseCategoryName(name) {
    var parsedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
    return parsedName;
}

var router = express.Router();

router.route('/')
    .get(function (req, res) {
        redisClient.hkeys('categories', function(error, categoryNames) {
            if(error) {
                throw error;
            }

            res.status(200).json(categoryNames);
        });
    })

    .post(parseUrlencoded, function (req, res) {
        if (req.body.name.length > 0 && req.body.description.length > 0) {
            redisClient.hset('categories', req.body.name, req.body.description, function(error) {
                if (error) throw error;

                res.status(201).json(req.body.name);
            });
        } else {
            res.status(400).json('Invalid Category Name');
        }
    });

router.route('/:name')

    .all(function (req, res, next) {
        req.categoryName = parseCategoryName(req.params.name);
        next();
    })

    .get(function (req, res) {
        var categoryInfo = redisClient.hget('categories', req.categoryName);
        if (categoryInfo) {
            res.status(200).json(categoryInfo);
        } else {
            res.status(404).json("Category not found");
        }
    })

    .delete(function (req, res) {
       if (redisClient.hget('categories', req.categoryName)) {
            redisClient.hdel('categories', req.categoryName, function(error) {
                if (error) throw error;
                res.sendStatus(204);
            });
        } else {
            res.sendStatus(404);
        }
    });

/* Serve static files from public directory */
app.use(express.static('public'));

app.use('/categories', router);

module.exports = app;
