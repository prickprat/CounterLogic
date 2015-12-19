/*jshint strict:false */
/*jslint node: true */

var express = require('express');
var server = express();

/* Serve static files from public directory */
server.use(express.static('public'));

var categories = require('./routes/categories');
server.use('/categories', categories);

module.exports = server;
