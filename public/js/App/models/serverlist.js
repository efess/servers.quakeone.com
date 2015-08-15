var $ = require('jquery');
var _ = require('underscore');
var statics = require('../modules/static')
var Backbone = require('backbone');
Backbone.$ = $;

var Server = Backbone.Model.extend({
    urlRoot:  statics.serverRoot + '/server/list',
    parse: function (data) {
        return data;
    }
});

module.exports = Server;
