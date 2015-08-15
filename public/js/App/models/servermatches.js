var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerMatches = Cacheable.extend({
    urlRoot: statics.serverRoot + '/api/server/matches',

    parse: function (data) {
        return { matches: data.serverdetail.matches.Records,
            total: data.serverdetail.matches.TotalRecords
        };
    }
});

module.exports = ServerMatches;
