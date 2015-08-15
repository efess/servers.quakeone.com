var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var DateTime = require('../../modules/datetime');

var HomeMatchesView = Backbone.View.extend({

    initialize: function () {
        this.model.on('change', this.render, this);
    },
    events: {
        'click tr': 'viewMatch',
    },
    tagName: 'div',
    template: _.template($('#home-matches').html()),
    render: function (eventName) {
        var self = this;

        if (this.model.has('recentmatches')) {
            var data = { matches: this.model.get('recentmatches') };

            var modelData = $.extend(true, {}, data);
            _.each(modelData.matches, function (match, idx) {
                match.MatchDuration = DateTime.secToSmallTimespan(match.MatchDuration);
                match.MatchEndAgo = DateTime.secToVerySmallTimespan(match.MatchEndAgo);
            });
            $(this.el).html(this.template(modelData));

        } else {
            // model is fetched by parent.
            $(this.el).html(this.template());
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

module.exports = HomeMatchesView;
