var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var DateTime = require('../../../modules/datetime');
var Static = require('../../../modules/static');
var SupportsPagination = require('../../base/pagination');

var PlayerDetailAliasesView = SupportsPagination.extend({
    initialize: function () {
        if (this.options && this.options.pageNumber) {
            this.pageNumber = this.options.pageNumber;
        }
        this.model.on('change', this.render, this);
    },
    template: _.template($('#player-detail-aliases').html()),
    isFetched: false,
    render: function (eventName) {
        var matchRows = $('#playerMatchsRows');

        if (this.model.has('aliases')) {
            var modelData = $.extend(true, {}, this.model.toJSON());
            _.each(modelData.aliases, function (alias) {
                alias.LastSeenAgo = DateTime.secToVerySmallTimespan(alias.LastSeenAgo);
            }, this);
            $(this.el).html(this.template(modelData));
            
            if (this.model.get('total') > 10) {
                $('#aliasPaginator', this.el).append(this.getPaginator());
            }
            this.applyNameMaker();
        } else {
            $(this.el).html(this.template());
            this.model.fetch({ data: { pageSize: self.pageCount, pageNumber: self.pageNumber }, type: 'POST' });
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
                    var size = Static.nameMaker.writeName(ctx, base64,canvas.height);
                    //              
                }
            }
        });
    }
});
module.exports = PlayerDetailAliasesView;
