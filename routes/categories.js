var express = require('express');
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });


var router = express.Router();

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


function parseCategoryName(name) {
    //Format the category name to be leading Uppercase
    if (name.length === 0) {
        return '';
    }

    var parsedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
    return parsedName;
}

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
        var categoryName = parseCategoryName(req.body.name);
        var categoryDescription = req.body.description;

        if (categoryName.length <= 0) {
            res.status(400).json('Invalid Category Name');
        } else if (categoryDescription.length <= 0) {
            res.status(400).json('Invalid Description');
        } else {
            redisClient.hset('categories', categoryName, categoryDescription, function(error) {
                if (error) throw error;

                res.status(201).json(categoryName);
            });
        }
    });

router.route('/:name')

    .all(function (req, res, next) {
        req.categoryName = parseCategoryName(req.params.name);
        next();
    })

    .get(function (req, res) {
        redisClient.hget('categories', req.categoryName, function(error, description) {
            if (error) throw error;

            if (description) {
                res.render('show.ejs', {
                    category: {
                        name: req.categoryName,
                        description: description
                    }
                });
            } else {
                res.sendStatus(404);
            }
        });
    })

    .delete(function (req, res) {
        redisClient.hexists('categories', req.categoryName, function(error, categoryExists) {
            if (error) throw error;

            if(categoryExists) {
                redisClient.hdel('categories', req.categoryName, function(error) {
                    if (error) throw error;
                    res.sendStatus(204);
                });
            } else {
                res.sendStatus(400);
            }
        });
    });

module.exports = router;