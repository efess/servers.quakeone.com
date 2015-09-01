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
            scaleShowLabels: false,
            responsive: true,
            maintainAspectRatio: true,
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

module.exports = ServerDetailInfoView;
