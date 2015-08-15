var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerMatches = Cacheable.extend({
    urlRoot: 'http://servers.quakeone.com/stats/PlayerMatches',
    idAttribute: 'PlayerId',

    parse: function (data) {
        if (data.playerdetail.matches == undefined) {
            return { matches: [], total: 0 };
        }
        return {
            matches: data.playerdetail.matches.Records,
            total: data.playerdetail.matches.TotalRecords
        };
    }
});

module.exports = PlayerMatches;
