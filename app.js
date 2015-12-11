/*jshint strict:false */
/*jslint node: true */

var express = require('express');
var app = express();

/* Serve static files from public directory */
app.use(express.static('public'));

var categories = require('./routes/categories');
app.use('/categories', categories);

module.exports = app;
