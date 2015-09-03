﻿var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../../modules/static');

var ServerDetailRanksView = Backbone.View.extend({

    initialize: function () {
        this.model.on('change', this.render, this);
    },
    template: _.template($('#server-detail-ranks').html()),
    render: function () {
        if (this.model.has('serverdetail')) {
            var modelData = $.extend(true, {}, this.model.toJSON());
            var data = $.map(modelData, function(val){
                val.FPM = parseFloat(val.FPM).toFixed(2);  
            });
            $(this.el).html(this.template(data));
            
            this.applyNameMaker();
        } else {
            $(this.el).html(this.template());
            this.model.fetch();
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
module.exports = ServerDetailRanksView;
