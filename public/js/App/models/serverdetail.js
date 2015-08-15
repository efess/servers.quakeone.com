var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerDetails = Cacheable.extend({
    urlRoot: 'http://servers.quakeone.com/stats/ServerDetailInfo',
    parse: function (data) {
        return data.serverdetail;
    }, expirationSecs: function () {
        return 200;
    }
});

module.exports = ServerDetails;
