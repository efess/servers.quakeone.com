var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var DateTime = require('../../../modules/datetime');
var SupportsPagination = require('../../base/pagination');

var PlayerDetailMatchesView = SupportsPagination.extend({
    initialize: function () {
        if (this.options && this.options.pageNumber) {
            this.pageNumber = this.options.pageNumber;
        }
        this.model.on('change', this.render, this);
    },
    events: {
        'click tr': 'viewMatch',
    },
    templateMatches: _.template($('#player-detail-matches').html()),
    templateMatch: _.template($('#player-detail-match').html()),
    isFetched: false,
    render: function (eventName) {
        $(this.el).html(this.templateMatches());

        var matchRows = $('#playerMatchsRows');

        if (this.model.has('matches')) {
            var modelData = $.extend(true, {}, this.model.toJSON());
            var matches = modelData.matches;
            _.each(matches, function (match) {
                match.StayDuration = DateTime.secToSmallTimespan(match.StayDuration);
                match.JoinTime = DateTime.secToSmallDateTime(match.JoinTime);
                matchRows.append(this.templateMatch(match));
            }, this);
            if (this.model.get('total') > 10) {
                $('#matchPaginator', this.el).append(this.getPaginator());
            }
        } else {
            this.model.fetch({ data: { pageSize: self.pageCount, pageNumber: self.pageNumber }, type: 'GET' });
        }

        return this;
    },
    viewMatch: function (evnt) {
        if (evnt.currentTarget) {
            var matchId = $(evnt.currentTarget).attr('mid');
            if (!matchId) return;
            Backbone.history.navigate("matches/" + matchId, true);
            //window.location.href = "#matches/" + matchId;
        }
    }
});
module.exports = PlayerDetailMatchesView;
