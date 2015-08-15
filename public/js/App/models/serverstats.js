var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerStats = Cacheable.extend({
    urlRoot: 'http://servers.quakeone.com/stats/ServerDetailStats',
    parse: function (data) {
        if (!data.serverdetail.stats)
            data.serverdetail.stats = {};
        if (!data.serverdetail.stats.map)
            data.serverdetail.stats.map = [];

        return data.serverdetail;
    }
});

module.exports = ServerStats;
