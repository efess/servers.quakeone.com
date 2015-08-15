var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var ServerDetail = require('../../../models/serverdetail');
var Chart = require('../../../../../lib/chart.js');

var ServerDetailInfoView = Backbone.View.extend({

    initialize: function () {
        this.model.on('change', this.render, this);
    },
    matchPageNumber: 0,
    tagName: 'div',
    isFetched: false,
    template: _.template($('#server-detail-info').html()),
    render: function (eventName) {
        var self = this;

        if (this.model.has('info')) {
            
            var modelData = $.extend(true, {}, this.model.toJSON()); 
            $(this.el).html(this.template(modelData));
            this.renderHourlyPlot(modelData.hourly);

        } else {
            this.model.fetch();
        }
        return this;
    },
    renderHourlyPlot: function (hourlyList) {

        if (hourlyList.length == 0) {
            $('#hourlyGraph').text('No Hourly data');
            return;
        }

        var hourlyArray = this.getHourlyArray(hourlyList[0]);

        var maxValue = _.max(hourlyArray, function (value) { return value[1];})[1];

        $.plot($("#hourlyGraph"), [
            {
                data: hourlyArray,
                lines: { show: true },
                points: { show: true }
            }],
            {
                grid: {
                    borderWidth: 0

                },
                yaxis: {
                    show: false,
                    max: maxValue > 30 ? maxValue : 30
                },
                xaxis: {
                    show: true,
                    tickSize: 1,
                    min: 0,
                    max: 24,
                    tickFormatter: function (val, axis) {
                        if (val == 0)
                            return "12am";
                        if (val == 6 || val == 18)
                            return "6";
                        if (val == 12)
                            return "Noon";
                        return '';
                    }
                }
            });
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

module.exports = ServerDetailInfoView;
