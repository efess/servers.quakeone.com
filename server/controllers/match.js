var express = require('express'),
    match = require('../model/match'),
    router = express.Router(),
    response = require('../helpers/response'),
    api = require('../helpers/apiFormat');;
  // , auth = require('../middlewares/auth')

router.get('/detail/:matchId', function(req, res) {
    var matchId = (req.params.matchId && parseInt(req.params.matchId));
    
    match.detail(matchId)
        .then(response.sendWithFormat(api.json, res), response.sendError(res))
})

module.exports = router