var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../../modules/static');

var Static = require('../../../models/serverstats');
var DateTime = require('../../../modules/datetime');

var Chart = require('../../../../../lib/chart.js');
//flotValueLabels: "../Libs/jquery.flot.valuelabels"

var ServerDetailStatsView = Backbone.View.extend({

    initialize: function(){
        this.model.on('change', this.render, this);
    },
    template: _.template($('#server-detail-stats').html()),
    render: function () {

        //$(this.el).html(this.template());
    
        if (this.model.get('stats')) {
            var modelData = $.extend(true, {}, this.model.toJSON());
            if (modelData.stats.playtime != null) {
                _.each(modelData.stats.playtime, function (elem,idx) {
                    elem.PlayTime = DateTime.secToSecMinHourTimespan(elem.PlayTime);
                });
            }
            $(this.el).html(this.template(modelData));
            this.renderMapPercentages(modelData.stats.map);
            this.applyNameMaker();
        }else{
            $(this.el).html(this.template());
            this.model.fetch();
        }
        return this;
    },
    renderMapPercentages: function (mapPercentages) {

        if (mapPercentages.length == 0) {
            $('#mapPercentageChart').text('No data');
            return;
        }
        if (mapPercentages.length < 10) {

            $('#mapPercentageChart').height(mapPercentages.length == 1
                ? 120 :
                500 * (mapPercentages.length / 10) + 15)
        }
        
        var percentageArray = [];
        var ticks = [];
        $.each(mapPercentages,
            function (idx, row) {
                var rev = mapPercentages.length - row.Position;
                ticks[rev] = row.Map;
                percentageArray.push(
                    [
                        parseFloat(row.Percentage),
                        rev
                    ]);
            });

        var maxValue = _.max(percentageArray, function (value) { return value[0]; })[0];

        $.plot($("#mapPercentageChart"), [
            {
                data: percentageArray,
                bars: 
                    {
                        //barWidth: 6,
                        barWidth: 0.5,
                        align: "center",

                        horizontal: true,
                    show:true
                    }, valueLabels: {
                        show: true,
                        plotAxis: "x",
                        labelFormatter: function (val) {
                            return val + "%";
                        }
                        , font: '14px "Helvetica Neue", Helvetica, Arial, sans-serif'
                    }
            }],
            {
                grid: {
                    borderWidth: 0
                },
                yaxis: {
                    show: true,
                    tickLength: 0,
                    tickSize: 1,
                    tickFormatter: function (val, axis) {
                        return ticks[val] || '';
                        //return val;
                    },
                    font:{
                        size: 14,
                        weight: "bold",
                        family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        color: '#000000'
                    } 

                },
                xaxis: {
                    min: 0,
                    max: maxValue > 80 ? 100 : maxValue + 15,
                    show: true
                }
            });
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
module.exports = ServerDetailStatsView;
