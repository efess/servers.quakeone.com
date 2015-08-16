var express = require('express'),
    router = express.Router(),
    server = require('../model/server'),
    match = require('../model/match'),
    r = require('ramda'),
    Promise = require('promise'),
    response = require('../helpers/response'),
    u = require('../helpers/util'),
    api = require('../helpers/apiFormat');

router.get('/list/:gameId?', function(req, res) {
    var gameId = (req.params.gameId && parseInt(req.params.gameId)) || 0
    var responseObj = {};
    server.getStatusByGame(gameId)
        .then(r.compose(r.always(responseObj), u.setProp('servers', responseObj)))
        .then(response.sendWithFormat(api.json, res), response.sendError(res)); 
});

router.get('/detail/:serverId', function(req, res) {
    var serverId = (req.params.serverId && parseInt(req.params.serverId)) || 0;
            
    var responseObj = { serverdetail: {}};
    
    Promise.all([
        server.getDetail(serverId).then(u.setProp('info',responseObj.serverdetail)),
        server.getHourly(serverId).then(u.setProp('hourly',responseObj.serverdetail))
    ])
        .then(r.always(responseObj))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
        
});

router.get('/ranks/:serverId', function(req, res) {
    var serverId = (req.params.serverId && parseInt(req.params.serverId)) || 0;
            
    var responseObj = { serverdetail: {}};
    
    Promise.all([
        server.getPlayerRanks(serverId).then(u.setProp('ranks',responseObj.serverdetail))
    ])
        .then(r.always(responseObj))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
        
});

router.get('/stats/:serverId', function(req, res) {
    var serverId = (req.params.serverId && parseInt(req.params.serverId)) || 0;
    var date = u.formatDate(new Date());
    var rObj = { 
        serverdetail: {
            stats: {
                map: [],
                playtime: []
            }
        }
    };
    
    Promise.all([
        server.getMapStats(serverId, date).then(u.setProp('map', rObj.serverdetail.stats)),
        server.getPlayerPlayTime(serverId, date).then(u.setProp('playtime', rObj.serverdetail.stats))
    ])
        .then(r.always(rObj))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
        
});

router.get('/matches/:serverId', function(req, res) {
    var serverId = (req.params.serverId && parseInt(req.params.serverId)) || 0,
        pageSize = u.intInRange(req.query.pageSize, 1, 50) || 10,
        pageNumber = u.intInRange(req.query.pageNumber, 0, 99999) || 0;
            
    var responseObj = { serverdetail: {} };
    
    match.getMatchByServer(serverId, pageNumber, pageSize).then(u.setProp('matches', responseObj.serverdetail))
        .then(r.always(responseObj))
        .then(response.sendWithFormat(api.json, res), response.sendError(res));
});




module.exports = router 