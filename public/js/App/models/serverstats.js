var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerStats = Cacheable.extend({
    urlRoot: statics.serverRoot + '/api/server/stats',
    parse: function (data) {
        if (!data.serverdetail.stats)
            data.serverdetail.stats = {};
        if (!data.serverdetail.stats.map)
            data.serverdetail.stats.map = [];

        return data.serverdetail;
    }
});

module.exports = ServerStats;
