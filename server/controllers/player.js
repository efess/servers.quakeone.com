var express = require('express'),
    Promise = require('promise'),
    router = express.Router(),
    r = require('ramda'),
    player = require('../model/player'),
    match = require('../model/match'),
    response = require('../helpers/response'),
    api = require('../helpers/apiFormat');;
  // , auth = require('../middlewares/auth')

router.get('/detail/:playerId', function(req, res) {
    var playerId = (req.params.playerId && parseInt(req.params.playerId)),
        setProp = r.curry(function (prop, objInstance, value) { 
                objInstance[prop] = value;
            });
            
    var responseData = {};
    
    Promise.all([
        player.getDetail(playerId).then(setProp('summery', responseData)),
        match.getMatchByPlayer(playerId, 0, 10).then(setProp('matches', responseData)),
        player.getPlayerHourly(playerId).then(setProp('hourly', responseData))
    ])  .then(r.always(responseData))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
});

module.exports = router