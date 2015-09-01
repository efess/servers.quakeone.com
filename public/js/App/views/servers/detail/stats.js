var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../../modules/static');
var DateTime = require('../../../modules/datetime');

var Chart = require('../../../../../lib/chart.js');
window.Chart = Chart;
var HorizontalBar = require('../../../../../lib/chart.horizontalbar.js');
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
        var labels = [];
        for(var i = mapPercentages.length - 1; i >= 0; i--){
            labels.push(mapPercentages[i].Map);
            percentageArray.push(parseFloat(mapPercentages[i].Percentage));
        }

        var maxValue = _.max(percentageArray, function (value) { return value[0]; })[0];
        var data = {
            labels: labels,
            datasets: [
                {
                    fillColor: "rgba(255,204,51,0.5)",
                    strokeColor: "rgba(255,204,51,0.8)",
                    highlightFill: "rgba(255,204,51,0.75)",
                    highlightStroke: "rgba(255,204,51,1)",
                    data: percentageArray
                }
            ]
        };
        
        
        var myBarChart = new Chart(
            document.getElementById("mapPercentageChart").getContext("2d")
        ).HorizontalBar(data, {
            responsive: true,
            maintainAspectRatio: true});
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
