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
        redisClient.smembers('categories', function(error, categoryNames) {
            var categories = [];

            if(error) {
                throw error;
            }
            categoryNames.forEach(function(categoryName) {
                redisClient.hmget('category:' + categoryName, [
                        'name',
                        'description',
                        'count'
                    ], function(error, categoryInfo){
                        if (error) throw error;

                        categories.push({
                            name: categoryInfo[0],
                            description: categoryInfo[1],
                            count: categoryInfo[2]
                        });

                        if (categories.length === categoryNames.length) {
                            res.status(200).json(categories);
                        }
                    });
            });
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
            redisClient.sadd('categories', categoryName, function(error) {
                if (error) throw error;
                redisClient.hmset('category:' + categoryName, [
                    'name', categoryName,
                    'description', categoryDescription,
                    'count', 0
                    ],
                    function(error){
                        if (error) {
                            throw error;
                        }
                        res.status(201).json({'name':categoryName, 'count': 0});
                    })
            });
        }
    });

router.route('/:name')

    .all(function (req, res, next) {
        req.categoryName = parseCategoryName(req.params.name);
        next();
    })

    .get(function (req, res) {
        redisClient.hget('category:' + req.categoryName, 'description', function(error, description) {
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
        redisClient.sismember('categories', req.categoryName, function(error, categoryExists){
            if (error) throw error;
            if (categoryExists) {
                redisClient.srem('categories', req.categoryName, function(error) {
                    if (error) throw error;
                    redisClient.del('category:'+ req.categoryName, function(error) {
                        if (error) throw error;
                    });
                    res.sendStatus(204);
                });
            } else {
                res.sendStatus(400);
            }
        });
    });

module.exports = router;