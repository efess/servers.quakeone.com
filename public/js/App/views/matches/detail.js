var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Match = require('../../models/match');
var DateTime = require('../../modules/datetime');
var Static = require('../../modules/static');

var MatchDetailView = Backbone.View.extend({
    initialize: function () {
        this.model.on('change', this.render, this);
    },
    tagName: 'div',
    isFetched: false,
    template: _.template($('#match-detail').html()),
    render: function () {
        var self = this;
        var html = "";

        if (this.model.has("HostName")) {
            var modelData = $.extend(true, {}, this.model.toJSON());

            var originalStart = new Date(modelData.MatchStart);
            
            modelData.MatchLength =
                DateTime.secToSmallTimespan(modelData.MatchDuration);

            modelData.MatchStart =
                DateTime.secToSmallDateTime(modelData.MatchStart);


            _.each(modelData.Players, function (player) {
                var playerStart = new Date(player.PlayerMatchStart);
                
                
                var late = (playerStart.getTime() - originalStart.getTime()) / 1000;
                if (late > 60)
                    player.Late =
                        DateTime.secToSmallTimespan(late);
                else player.Late = "";
                player.Duration =
                    DateTime.secToSmallTimespan(
                        player.PlayerStayDuration);
            });
            $(this.el).html(this.template(modelData));
            this.applyNameMaker();
        } else {
            this.model.fetch();
            $(this.el).html(this.template());
            //$(this.el).html(this.template());
        }

        return this;
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

module.exports = MatchDetailView;
