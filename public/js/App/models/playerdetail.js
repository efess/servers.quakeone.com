var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerDetail =  Cacheable.extend({
    urlRoot: 'http://servers.quakeone.com/stats/PlayerDetail',
    idAttribute: 'PlayerId'
});

module.exports = PlayerDetail;
