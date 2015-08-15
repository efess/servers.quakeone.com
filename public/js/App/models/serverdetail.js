var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static')
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerDetails = Cacheable.extend({
    urlRoot: statics.serverRoot + '/api/server/detail',
    parse: function (data) {
        return data.serverdetail;
    }, expirationSecs: function () {
        return 200;
    }
});

module.exports = ServerDetails;
