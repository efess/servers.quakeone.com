var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var statics = require('../modules/static');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerRanks = Cacheable.extend({
        urlRoot: statics.serverRoot + '/api/server/ranks',
        parse: function (data) {
            return {
                serverdetail: {
                    ranks: data.ranks
                }
            };
        }
    });

module.exports = ServerRanks;
