var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var PlayerSearch = require('../../models/playersearch');
var PlayerSearchListView = require('./list');

var PlayerSearchFormView = Backbone.View.extend({
    initialize: function () {

    },
    
    tagName: 'div',
    isFetched: false,
    template: _.template($('#player-search-form').html()),
    render: function () {
        $(this.el).html(this.template());

        this.playerSearchList = new PlayerSearchListView(
            {
                model: new PlayerSearch({ id: this.id }),
                el: $('#playerList'),
            })
            .render();

        return this;
    },
    events: {
        'click #searchButton': 'doSearch'
    },
    doSearch: function () {
        var searchTerm = $('#playerSearchTerm').val();
        if (!searchTerm || searchTerm === '')
            return;

        var params = {
            searchTerms: {
                playerName: searchTerm
            }
        };
        this.playerSearchList.setParams(params).performSearch();
        return false;
    }
});

module.exports = PlayerSearchFormView;
