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
        var maxValue = _.max(hourlyArray, function (value) { return value[1]; })[1];

        // $.plot($("#hourlyGraph"), [
        //     {
        //         data: hourlyArray,
        //         lines: { show: true },
        //         points: { show: true }
        //     }],
        //     {
        //         grid: {
        //             borderWidth: 0
        //         },
        //         yaxis: {
        //             show: false,
        //             max: maxValue > 30 ? maxValue : 30
        //         },
        //         xaxis: {
        //             show: true,
        //             tickSize: 1,
        //             min: 0,
        //             max: 24,
        //             tickFormatter: function (val, axis) {
        //                 if (val == 0)
        //                     return "12am";
        //                 if (val == 6 || val == 18)
        //                     return "6";
        //                 if (val == 12)
        //                     return "Noon";
        //                 return '';
        //             }
        //         }
        //     });
    },
    getHourlyArray: function(jsonHourly){
        var withoutGmt = [
            parseInt(jsonHourly.hour0),
            parseInt(jsonHourly.hour1),
            parseInt(jsonHourly.hour2),
            parseInt(jsonHourly.hour3),
            parseInt(jsonHourly.hour4),
            parseInt(jsonHourly.hour5),
            parseInt(jsonHourly.hour6),
            parseInt(jsonHourly.hour7),
            parseInt(jsonHourly.hour8),
            parseInt(jsonHourly.hour9),
            parseInt(jsonHourly.hour10),
            parseInt(jsonHourly.hour11),
            parseInt(jsonHourly.hour12),
            parseInt(jsonHourly.hour13),
            parseInt(jsonHourly.hour14),
            parseInt(jsonHourly.hour15),
            parseInt(jsonHourly.hour16),
            parseInt(jsonHourly.hour17),
            parseInt(jsonHourly.hour18),
            parseInt(jsonHourly.hour19),
            parseInt(jsonHourly.hour20),
            parseInt(jsonHourly.hour21),
            parseInt(jsonHourly.hour22),
            parseInt(jsonHourly.hour23)
        ];      
        var withGmt = [];
        var i, j;
        for(i = 0, j = new Date().getTimezoneOffset() /60; i < 24; i++, j++){
            if(j === 24) j = 0;
            withGmt[i] = [i,withoutGmt[j]];
        }
        return withGmt;
    }

});

module.exports = PlayerDetailView;
