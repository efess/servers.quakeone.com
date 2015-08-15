var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var DateTime = require('../../modules/datetime');
var Static = require('../../modules/static');

var HomeServersView = Backbone.View.extend({

    initialize: function () {
        this.model.on('change', this.render, this);
    },
    tagName: 'div',
    template: _.template($('#home-servers').html()),
    render: function (eventName) {
        var self = this;

        if (this.model.has('servers')) {
            var data = { servers: this.model.get('servers') };
            var modelData = $.extend(true, {}, data);

            _.each(modelData.servers, function (server, idx) {
                if (server.Players) {
                    _.each(server.Players, function (player, pdx) {
                        player.TotalPlayTime = DateTime.secToVerySmallTimespan(player.TotalPlayTime);
                    });
                }
            });

            $(this.el).html(this.template(modelData));
            this.applyNameMaker();
        } else {
            // model is fetched by parent.
            $(this.el).html(this.template());
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
                    var size = Static.nameMaker.writeName(ctx, base64, canvas.height);
                    //              
                }
            }
        });
    }
});

module.exports = HomeServersView;
