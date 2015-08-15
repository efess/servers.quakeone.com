var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerDetail =  Cacheable.extend({
    urlRoot: statics.serverRoot + '/api/player/detail',
    idAttribute: 'PlayerId'
});

module.exports = PlayerDetail;
