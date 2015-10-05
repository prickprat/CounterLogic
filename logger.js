module.exports = function(request, response, next) {
    var startTime = +new Date();
    var stream = process.stdout;
    var url = request.url;
    var method = request.method;

    response.on('finish', function() {
        var duration = +new Date() - startTime;
        var msg = method + " to " + url + '\n' +
                    'took ' + duration + ' ms. \n\n';
        stream.write(message);
    })


    next();
}