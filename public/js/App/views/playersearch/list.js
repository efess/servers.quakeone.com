var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var SupportsPagination = require('../base/pagination');

var PlayerSearchListView = SupportsPagination.extend({
    initialize: function () {
        this.model.on('change', this.render, this);
    },
    setParams: function (params) {
        _.extend(this.params || (this.params = {}), params);
        return this;
    },
    params: {
        searchTerms: {
            playerName: ''
        }
    },
    tagName: 'div',
    isFetched: false,
    template: _.template($('#player-search-list').html()),
    render: function () {

        if(this.model.has('players')){

            var modelData = $.extend(true, {}, this.model.toJSON());

            _.each(modelData.players, function (player) {
                player.LastSeenAgo =
                    DateTime.secToVerySmallTimespan(player.LastSeenAgo);
            });

            $(this.el).html(this.template(modelData));

            $('#paginator', this.el).append(this.getPaginator());
            this.applyNameMaker();
        } else {
            $(this.el).html(this.template());
        }

        return this;
    },
    performSearch: function () {
        $(this.el).html('<tr class="centered"><img src="Images/loading.gif"></img></tr>');
        this.firstPage();
    },
    setPostData: function (data) {
        return _.extend(data || (data = {}), { term: this.params.searchTerms.playerName });
    },
    applyNameMaker: function () {

        $.each($('.name-graphic'), function (i, canvas) {

            if (canvas.getContext) {
                var base64 = $.attr(canvas, 'value');
                if (base64 !== undefined &&
                    base64 !== null && base64 !== '') {

                    var ctx = canvas.getContext("2d");
                    var size = Static.nameMaker.writeName(ctx, base64);
                    //              
                }
            }
        });
    }
});

module.exports = PlayerSearchListView;
