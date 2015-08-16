var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var ServerList = require('../../models/serverlist');



var ServerListView = Backbone.View.extend({

    tagName: 'table',
    timerIntervalId: 0,
    initialize: function () {
        //this.listenTo(this.model, "change", this.render);
    },
    startRefresh: function () {
        var self = this;
        this.autoRefresh = true;
        this.refresh();
        this.timerIntervalId = setInterval(function () {
            if (!self.autoRefresh) {
                return;
            }
            else self.refresh();
        }, 10000);
    },
    stopRefresh: function(){
        this.autoRefresh= false;
        if(this.timerIntervalId > 0){
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = 0;
        }
        //this.render();
    },
    refresh: function () {
        this.model = new ServerList({ id: this.id });
        this.model.on('change', this.render, this);
        this.model.fetch();
    },
    template: _.template($('#server-list').html()),
    render: function (eventName) {
        var self = this;
        
        var modelData = {
            toggle: this.autoRefresh ? "on" : "off"
        };

        if (!this.model.has('servers')) {
            this.model.fetch();
        } else {
            var servers = this.model.get('servers');


            var sorting = {
                'Running': 0,
                'NotResponding': 1,
                'NotFound': 2
            }
            var servers = _.sortBy(servers, function (elem) {
                return sorting[elem.Status];
            });

            var modelData = $.extend(true, modelData, { servers: servers });
            _.each(modelData.servers, function (server, idx) {
                if (server.Players) {
                    _.each(server.Players, function (player, pdx) {
                        player.TotalPlayTime = DateTime.secToVerySmallTimespan(player.TotalPlayTime);
                    });
                }
            });
        }

        $(this.el).html(this.template(modelData));

        $('#toggleRefresh').click(function () {
            self.toggleAutoRefresh();
            self.render();
        });

        this.applyNameMaker();
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
    },
    autoRefresh: true,
    toggleAutoRefresh: function () {
        if (this.autoRefresh) {
            this.stopRefresh();
        } else {
            this.startRefresh();
        }
        this.render();
    }

});

module.exports = ServerListView;
