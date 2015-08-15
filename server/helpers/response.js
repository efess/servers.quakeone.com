var r = require('ramda');

var response = {
    sendWithFormat: r.curry(function(apiFormat, response, obj) {
        response.set('Content-Type', apiFormat.contentType);
        response.send(apiFormat.transform(obj));
    }),
    sendError: r.curry(function (response, err) {
        response.send("Server error: " + err);
    })
}

module.exports = response;