var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Player = require('../../models/player');
var PlayerDetailMatches = require('../../models/playermatches');
var PlayerDetailAliases = require('../../models/playeraliases');
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var PlayerDetailMatchesView = require('./detail/matches');
var PlayerDetailAliasesView = require('./detail/aliases');

var Chart = require('../../../../lib/chart.js');

var PlayerDetailView = Backbone.View.extend({
    initialize: function () {
        this.model.on('change', this.render, this);
    },
    setParams: function (params) {
        _.extend(this.params || (this.params = {}), params);
        return this;
    },
    tagName: 'div',
    template: _.template($('#player-detail').html()),
    render: function () {
        
        if (!this.model.has('summery')) {
            $(this.el).html(this.template());
            this.model.fetch({ data: { pageSize: self.pageCount, pageNumber: self.pageNumber }, type: 'GET' });
        } else {
            var modelData = $.extend(true, {}, this.model.toJSON());

            modelData.summery.LastSeenAgo =
                DateTime.secToVerySmallTimespan(modelData.summery.LastSeenAgo);
            modelData.summery.TotalTime =
                DateTime.secToSecMinHourTimespan(modelData.summery.TotalTime);
            modelData.summery.WeekTime =
                DateTime.secToSecMinHourTimespan(modelData.summery.WeekTime);
            $(this.el).html(this.template(modelData));
            this.renderHourlyPlot(modelData.hourly);
            this.matchesView = new PlayerDetailMatchesView(
                {
                    el: $('#playerMatches'),
                    model: new PlayerDetailMatches({
                        PlayerId: this.model.id
                    }),
                    pageNumber: this.params.matchPageNumber,
                });
            this.matchesView.render();
            this.aliasesView = new PlayerDetailAliasesView(
                {
                    el: $('#playerAliases'),
                    model: new PlayerDetailAliases({
                        PlayerId: this.model.id
                    })
                });
            this.aliasesView.render();
            this.applyNameMaker();
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
    },
    renderHourlyPlot: function (hourlyList) {

        if (hourlyList.length == 0) {
            $('#hourlyGraph').text('No Hourly data');
            return;
        }

        var hourlyArray = this.getHourlyArray(hourlyList);

        var maxValue = _.max(hourlyArray, function (value) { return value[1];})[1];
        var labels = _.map(hourlyArray, function(elem, idx) {
            if (idx == 0)
                return "12am";
            if (idx == 6 || idx == 18)
                return "6";
            if (idx == 12)
                return "Noon";
            return '';
        });
        var data = {
            labels: labels,
            datasets: [ {
                fillColor: "rgba(255,204,51,0.2)",
                strokeColor: "rgba(255,204,51,1)",
                pointColor: "rgba(255,204,51,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255,204,51,1)",
                data: hourlyArray
            }]
        };
        
        new Chart(
            document.getElementById("hourlyGraph").getContext("2d")
        ).Line(data, {
            scaleShowHorizontalLines: false,
            showTooltips: false,
            scaleShowLabels: false
        });
    },
    getHourlyArray: function(jsonHourly){
        var withoutGmt = [];
        var i, j;
        for(i = 0; i < 24; i++) {
            withoutGmt[i] = parseInt(jsonHourly['hour' + i.toString()]);
        }
        var withGmt = [];
        for(i = 0, j = new Date().getTimezoneOffset() /60; i < 24; i++, j++){
            if(j === 24) j = 0;
            withGmt[i] = withoutGmt[j];
        }
        return withGmt;
    }
});

module.exports = PlayerDetailView;
