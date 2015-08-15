var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Cacheable = require('./cacheable');

var ServerRanks = Cacheable.extend({
        urlRoot: 'http://servers.quakeone.com/stats/ServerDetailRanks',
        parse: function (data) {
            return {
                serverdetail: {
                    ranks: data.ranks
                }
            };
        }
    });

module.exports = ServerRanks;
