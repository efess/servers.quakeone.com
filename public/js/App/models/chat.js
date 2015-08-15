var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var Chat = Backbone.Model.extend({
    urlRoot: 'http://servers.quakeone.com/stats/Chat',
    parse: function (data) {
        return data;
    }
});

module.exports = Chat;
