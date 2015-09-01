var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');

var ServerDetail = require('../../models/serverdetail');
var ServerDetailStats = require('../../models/serverstats');
var ServerDetailMatches = require('../../models/servermatches');
var ServerDetailRanks = require('../../models/serverranks');

var ServerDetailStatsView = require('../servers/detail/stats');
var ServerDetailInfoView = require('../servers/detail/info');
var ServerDetailMatchesView = require('../servers/detail/matches');
var ServerDetailRanksView = require('../servers/detail/ranks');

var ServerDetailView = Backbone.View.extend({

    initialize: function () {        
    },
    setParams: function (params) {
        _.extend(this.params || (this.params = {}), params);
        return this;
    },
    matchPageNumber: 0,
    tagName: 'div',
    isFetched: false,
    template: _.template($('#server-details').html()),
    render: function (eventName) {
        var self = this;

        $(this.el).html(this.template());

        if (!this.matchesView) {
            this.matchesView = new ServerDetailMatchesView(
                {
                    el: $('#serverMatches'),
                    model: new ServerDetailMatches({
                        id: this.model.id
                    }),
                    pageNumber: this.params.matchPageNumber,
                });
            this.matchesView.render();

            this.statsView = new ServerDetailStatsView(
                {
                    el: $('#serverStats'),
                    model: new ServerDetailStats({
                        id: this.model.id
                    })
                });
            this.statsView.render();

            this.ranksView = new ServerDetailRanksView(
                {
                    el: $('#serverRanks'),
                    model: new ServerDetailRanks({
                        id: this.model.id
                    })
                });
            this.ranksView.render();
        }

        if(!this.infoView){
            this.infoView = new ServerDetailInfoView(
                {
                    el: $('#serverInfo'),
                    model: new ServerDetail({
                        id: this.model.id
                    })
                });
            this.infoView.model.on('change', function () {
                var info = this.model.get('info');
                var header = "Details of " + info.Name;
                if(info.DNS !== info.Name)
                    header = header + " (" + info.DNS + ")";
                $('.server-header').text(header);
            }, this.infoView);
            this.infoView.render();
        }

        return this;
    }
});

module.exports = ServerDetailView;
