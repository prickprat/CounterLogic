/*jshint strict:false */
/*jslint node: true */

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });

var categoryStore = {
  'Lotopia': 'Rough and mountainous',
  'Caspiana': 'Sky-top island',
  'Indigo': 'Vibrant and thriving',
  'Paradise': 'Lush, green plantation',
  'Flotilla': 'Bustling urban oasis'
};

//Format the category name to be leading Uppercase
function parseCategoryName(name) {
    var parsedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
    return parsedName;
}

//Adds a new category to the store
function createCategory(name, description) {
    categoryStore[name] = description;
    return name;
}

var router = express.Router();

router.route('/')
    .get(function (req, res) {
        var categoryNames = Object.keys(categoryStore);
        response.status(200).json(categoryNames);
    })

    .post(parseUrlencoded, function (req, res) {
        if (req.body.name.length > 0) {
            var categoryName = createCategory(req.body.name, req.body.description);
            res.status(201).json(categoryName);
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
        var categoryInfo = categoryStore[req.categoryName];
        if (categoryInfo) {
            res.status(200).json(categoryInfo);
        } else {
            res.status(404).json("Category not found");
        }
    })

    .delete(function (req, res) {
        if(categoryStore[req.categoryName]) {
            delete categoryStore[req.categoryName];
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

/* Serve static files from public directory */
app.use(express.static(__dirname + '/public'));

app.use('/categories', router);

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port %d\n', port);
});