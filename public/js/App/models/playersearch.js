var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerSearch = Backbone.Model.extend({
    urlRoot: 'http://servers.quakeone.com/stats/PlayerLookup',
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
