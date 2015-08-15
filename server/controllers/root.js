var express = require('express'),
    router = express.Router(),
    server = require('../model/server'),
    path = require('path'),
    r = require('ramda'),
    apiFormat = require('../helpers/apiFormat');
  // , auth = require('../middlewares/auth')

var formatBeforeTransform =  r.curry(function(format, servers){
    if(format === 'json'){
        return {Servers: servers};
    }
    return servers;
});

router.get('/', function(req, res) {
    if(req.query.format){
        var formatter = apiFormat[req.query.format];
        if(formatter) {
            server.allStatus()
                .then(formatBeforeTransform(req.query.format))
                .then(formatter.transform)
                .then(function(body) { 
                    res.set('Content-Type', formatter.contentType);
                    res.send(body);
                });
        } else {
            res.send('Invalid format.');
        }
    } else {

        res.sendFile(path.join(__dirname, '../../public', 'index.html'));
    }
});

module.exports = router