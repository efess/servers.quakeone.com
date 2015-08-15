var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static.js')
Backbone.$ = $;

var Home = Backbone.Model.extend({
    urlRoot: statics.serverRoot + '/home/summary',
    parse: function (data) {
        return {
            servers: data.homedata.servers,
            recentmatches: data.homedata.recentmatches
        };
    }
});

module.exports = Home;
