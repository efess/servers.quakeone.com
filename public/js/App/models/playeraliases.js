var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static')
Backbone.$ = $;
var Cacheable = require('./cacheable');

var PlayerAliases = Cacheable.extend({
    urlRoot: statics.serverRoot + '/api/player/alias',
    idAttribute: 'PlayerId',

    parse: function (data) {
        if (data.playeraliases == undefined) {
            return { aliases: [], total: 0 };
        }
        return {
            aliases: data.playeraliases.Records,
            total: data.playeraliases.TotalRecords
        };
    }
});

module.exports = PlayerAliases;
