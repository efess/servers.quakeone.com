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
    var gameId = req.params.gameId && parseInt(req.params.gameId) || 0;
    var response = {
        homedata: {
                recentmatches: [],
                servers: []
            }
        };

    Promise.all([
            match.recentMatches(gameId).then(util.setProp('recentmatches', response.homedata)),
            server.getStatusByGame(gameId).then(util.setProp('servers', response.homedata))
        ])
        .then(r.always(response))
        .then(resHelper.sendWithFormat(apiFormat.json, res), resHelper.sendError);
})

module.exports = router