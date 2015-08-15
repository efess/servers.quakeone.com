var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static')
Backbone.$ = $;

var Match = Backbone.Model.extend({
    urlRoot: statics.serverRoot + '/api/match/detail',
    idAttribute: 'MatchId'
});

module.exports = Match;
