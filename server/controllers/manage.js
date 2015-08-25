var express = require('express'),
    auth = require('../middleware/auth'),
    path = require('path'),
    server = require('../model/server'),
    response = require('../helpers/response'),
    r = require('ramda'),
    api = require('../helpers/apiFormat'),
    u = require('../helpers/util'),
    router = express.Router();

router.use(auth);

router.put('/definition/:serverId', function(req, res) {
    return server.setDefinition(req.body)
        .then(response.sendWithFormat(api.json, res), response.sendError(res)); 
});

router.post('/definition', function(req, res) {
    return server.setDefinition(req.body)
        .then(response.sendWithFormat(api.json, res), response.sendError(res)); 
});

router.get('/definition/:serverId', function(req, res) {
    var serverId = (req.params.serverId && parseInt(req.params.serverId));
    
    return server.getDefinition(serverId)
        .then(response.sendWithFormat(api.json, res), response.sendError(res)); 
});

router.delete('/definition/:serverId', function(req, res) {
    var serverId = (req.params.serverId && parseInt(req.params.serverId));
    
    return server.deleteDefinition(serverId)
        .then(response.sendWithFormat(api.json, res), response.sendError(res)); 
});

router.get('/list', function(req,res) {
    var responseObj = {};
    server.allDefinitions()
        .then(r.compose(r.always(responseObj), u.setProp('serverDefinitions', responseObj)))
        .then(response.sendWithFormat(api.json, res), response.sendError(res)); 
});


module.exports = router