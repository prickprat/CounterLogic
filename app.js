var express = require('express');
var app = express();

var logger = require('./logger');
app.use(logger);

app.use(express.static('public'));

app.get('/blocks', function (request, response) {
    var blocks = ['Test', 'Test1', 'Test3'];
    response.json(blocks);
})

app.listen(3000, function () {
    console.log('Listening of 3000 \n');
});