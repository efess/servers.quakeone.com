
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var HomeMatchesView = require('./matches');
var HomeServersView = require('./servers');
var HomeChatView = require('./chat');
var Home = require('../../models/home');
var Chat = require('../../models/chat');

var HomeView = Backbone.View.extend({

    initialize: function () {
    },
    tagName: 'div',
    template: _.template($('#home').html()),
    events: {
        'click a#toggleRefresh': 'toggleRefresh'
    },
    render: function (eventName) {
        var self = this;

        this.model = new Home({ id: this.id });

        var options = {
            toggle: true
        };

        $(this.el).html(this.template(options));

        var homeMatchesView = new HomeMatchesView({
            el: $('#homeMatches'),
            model: this.model
        }).render();
        var homeServersView = new HomeServersView({
            el: $('#homeServers'),
            model: this.model
        }).render();
        var homeChatView = new HomeChatView({
            el: $('#homeChat'),
            model: new Chat()
        }).render();

        this.model.fetch();
        if (!this.timerRunning) {
            this.startRefresh();
        }

        return this;
    },
    timerRunning: false,
    timerIntervalId: -1,
    toggleRefresh: function () {
        if (this.timerRunning) {
            this.stopRefresh();
        } else {
            this.startRefresh();
        }
        $('#toggleRefresh').text(this.timerRunning ? 'on' : 'off');
        return false;
    },
    startRefresh: function () {
        var self = this;
        this.timerIntervalId = setInterval(function () {
            self.model.fetch();
            self.timerRunning = true;
        }, 15000);
        this.timerRunning = true;
    },
    stopRefresh: function () {
        clearInterval(this.timerIntervalId);
        this.timerRunning = false;
    }

});

module.exports = HomeView;
