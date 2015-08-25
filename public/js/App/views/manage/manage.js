var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');

var ManageServerListView = require('./serverList');

var Manage = Backbone.View.extend({

    initialize: function () {
              
    },
    tagName: 'div',
    isFetched: false,
    template: _.template($('#manage-servers').html()),
    render: function (eventName) {
        var self = this;

        $(this.el).html(this.template());

        this.manageServerListView = new ManageServerListView({
           el: $('#manageServerList') 
        }).render();
        

        return this;
    }
});

module.exports = Manage;
