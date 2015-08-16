var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../../modules/static');
var DateTime = require('../../../modules/datetime');
var SupportsPagination = require('../../base/pagination');
var App = require('../../../app');

var ServerDetailMatchesView = SupportsPagination.extend({
    initialize: function () {
        if (this.options && this.options.pageNumber) {
            this.pageNumber = this.options.pageNumber;
        }
        this.model.on('change', this.render, this);
    },
    method: 'GET',
    events: {
        'click tr': 'viewMatch',
    },
    templateMatches: _.template($('#server-detail-matches').html()),
    templateMatch: _.template($('#server-detail-match').html()),
    render: function (eventName) {
        $(this.el).html(this.templateMatches());
        
        var matchRows = $('#serverMatchsRows');
        if (this.model.has('matches')) {
            matchRows.empty();
            var modelData = $.extend(true, {}, this.model.toJSON());
            var matches = modelData.matches;
            _.each(matches, function (match) {
                match.MatchDuration = DateTime.secToSmallTimespan(match.MatchDuration);
                match.MatchStart = DateTime.secToSmallDateTime(match.MatchStart);
                matchRows.append(this.templateMatch(match));
            }, this);
            $('#paginator',this.el).append(this.getPaginator());
        } else {
            this.model.fetch({ data: { pageSize: self.pageCount, pageNumber:self.pageNumber }, type: 'GET' });
        }

        return this;
    },
    viewMatch: function (evnt) {
        if (evnt.currentTarget) {
            var matchId = $(evnt.currentTarget).attr('mid');
            if (!matchId) return;
            Backbone.history.navigate("matches/" + matchId, true);
        }
    }
});

module.exports = ServerDetailMatchesView;
