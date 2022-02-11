var express = require('express'),
    router = express.Router(),
    user = require('../model/user'),
    server = require('../model/server'),
    path = require('path'),
    r = require('ramda'),
    apiFormat = require('../helpers/apiFormat');

var formatBeforeTransform =  r.curry(function(format, servers){
    if(format === 'json'){
        return {Servers: servers};
    }
    return servers;
});

router.get('/login', function(req, res) {
    if(req.session && req.session.user){
        res.redirect('/manage');
    }
    res.sendFile(path.join(__dirname, '../../html', 'login.html'));
});

router.post('/login', function(req, res) {
    var username = req.body.username || '',
        password = req.body.password || '';
    
    user.getUser(username, password)
        .then(function(result) {
           if(result && result.length){
                req.session.user = username;
                res.redirect('/manage');
           } else {
                res.send('Invalid login');
           }
        });
   
});

router.post('/logout', function(req, res) {
    if(req.session && req.session.user){
        delete req.session.user;
    }
    res.redirect('/');
});

router.get('*', function(req, res) {
    if(req.query.format){
        var formatter = apiFormat[req.query.format];
        var gameId = (req.query.gameId && parseInt(req.query.gameId)) || 0
        if(formatter) {
            server.getStatusByGame(gameId)
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
        res.sendFile(path.join(__dirname, '../../html', 'index.html'), (err => {

        }));
    }
});

module.exports = router