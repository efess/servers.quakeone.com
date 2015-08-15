var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerMatches = Cacheable.extend({
    urlRoot: 'http://servers.quakeone.com/stats/ServerDetailMatches',

    parse: function (data) {
        return { matches: data.serverdetail.matches.Records,
            total: data.serverdetail.matches.TotalRecords
        };
    }
});

module.exports = ServerMatches;
