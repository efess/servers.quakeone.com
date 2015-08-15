var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerSearch = Backbone.Model.extend({
    urlRoot: statics.serverRoot + '/api/player/lookup',
    parse: function (data) {
        if (!data.players) {
            return {
                players: [],
                total: 0
            };
        }
        return {
            players: data.players.Records,
            total: data.players.TotalRecords
        };
    }
});

module.exports = PlayerSearch;
