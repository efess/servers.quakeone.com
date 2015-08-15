var express = require('express'),
    match = require('../model/match'),
    r = require('ramda'),
    server = require('../model/server'),
    Promise = require('promise'),
    apiFormat = require('../helpers/apiFormat'),
    util = require('../helpers/util'),
    router = express.Router(),
    resHelper = require('../helpers/response');

router.get('/summary/:gameId', function(req, res) {
    var gameId = req.params.gameId;
    var response = {
        homedata: {
                recentmatches: [],
                servers: []
            }
        }, 
        setProp = r.curry(function (prop, objInstance, value) { 
            objInstance[prop] = value
        });

    Promise.all([
            match.recentMatches(gameId).then(setProp('recentmatches', response.homedata)),
            server.allStatus().then(setProp('servers', response.homedata))
        ])
        .then(r.always(response))
        .then(resHelper.sendWithFormat(apiFormat.json, res), resHelper.sendError);
})

module.exports = router