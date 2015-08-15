var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerMatches = Cacheable.extend({
    urlRoot: statics.serverRoot + '/api/player/match',
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
