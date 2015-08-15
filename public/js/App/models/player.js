var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var Player = Backbone.Model.extend({
    idAttribute: 'PlayerId'
});

module.exports = Player;
