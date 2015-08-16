var express = require('express'),
    Promise = require('promise'),
    router = express.Router(),
    r = require('ramda'),
    player = require('../model/player'),
    match = require('../model/match'),
    u = require('../helpers/util'),
    response = require('../helpers/response'),
    api = require('../helpers/apiFormat');;
  // , auth = require('../middlewares/auth')

router.get('/detail/:playerId', function(req, res) {
    var playerId = (req.params.playerId && parseInt(req.params.playerId));
            
    var responseData = {};
    
    Promise.all([
        player.getDetail(playerId).then(u.setProp('summery', responseData)),
        player.getPlayerHourly(playerId).then(u.setProp('hourly', responseData))
    ])  .then(r.always(responseData))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
});

router.get('/match/:playerId', function(req, res) {
    var playerId = (req.params.playerId && parseInt(req.params.playerId)),
        pageSize = u.intInRange(req.query.pageSize, 1, 50) || 10,
        pageNumber = u.intInRange(req.query.pageNumber, 0, 99999) || 0;
            
    var responseData = {
        playerdetail: {}
    };
    
    match.getMatchByPlayer(playerId, pageNumber, pageSize)
        .then(r.compose(r.always(responseData), u.setProp('matches', responseData.playerdetail)))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
});

router.get('/aliases/:playerId', function(req, res) {
    var playerId = (req.params.playerId && parseInt(req.params.playerId)),
        pageSize = u.intInRange(req.query.pageSize, 1, 50) || 10,
        pageNumber = u.intInRange(req.query.pageNumber, 0, 99999) || 0;
            
    var responseObj = {};
    
    player.lookup(playerId, pageNumber, pageSize)
        .then(r.compose(r.always(responseObj), u.setProp('playeraliases', responseObj)))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
});

router.post('/lookup/:gameId', function(req, res) {
    var gameId = (req.params.gameId && parseInt(req.params.gameId)),
        // Sanitize your inputs, bobby.
        searchTerm = req.body.term && req.body.term.substr(0, Math.min(16, req.body.term.length)) || '',
        pageSize = u.intInRange(req.body.pageSize, 1, 50) || 10,
        pageNumber = u.intInRange(req.body.pageNumber, 0, 99999) || 0;
    
    if(searchTerm === ''){
        response.sendError(res, 'No search term entered');
        return;   
    }
        
    var responseObj = {
        players: []
    };
    
    player.lookup(gameId, searchTerm, pageNumber, pageSize)
        .then(r.compose(r.always(responseObj), u.setProp('players', responseObj)))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
});
module.exports = router