var $ = require('jquery');
var _ = require('underscore');
var statics = require('../modules/static')
var Backbone = require('backbone');
Backbone.$ = $;

var ServerDefinition = Backbone.Model.extend({
    urlRoot:  statics.serverRoot + '/manage/definition',
    idAttribute: 'ServerId'
});

module.exports = ServerDefinition;
