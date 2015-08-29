var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static.js')
Backbone.$ = $;

var Chat = Backbone.Model.extend({
    urlRoot: statics.serverRoot + '/chat',
    parse: function (data) {
        return data;
    }
});

module.exports = Chat;
