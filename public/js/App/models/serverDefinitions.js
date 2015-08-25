var $ = require('jquery');
var _ = require('underscore');
var statics = require('../modules/static')
var Backbone = require('backbone');
Backbone.$ = $;

var ServerDefinitions = Backbone.Model.extend({
    urlRoot:  statics.serverRoot + '/manage/list',
    parse: function (data) {
        return data;
    }
});

module.exports = ServerDefinitions;
