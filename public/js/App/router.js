var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Manage = require('./views/manage/manage');
var ServerUpdate = require('./models/serverDefinition');
var ServerUpdateView = require('./views/manage/update');
var ServerListView = require('./views/servers/list');
var ServerDetailView = require('./views/servers/detail');
var PlayerDetailView = require('./views/players/detail');
var HomeView = require('./views/home/home');
var MatchDetailView = require('./views/matches/detail');
var ServerDetails = require('./models/serverdetail');
var PlayerDetails = require('./models/playerdetail');
var Match = require('./models/match');
var PlayerSearchFormView = require('./views/playersearch/form');
var NavBar = require('./views/navbar');
var Static = require('./modules/static');
    
var AppRouter = Backbone.Router.extend({
    
    initialize: function () {
        var self = this;

        this.homeView = new HomeView({ el: $('#content') });
        this.serverListView = new ServerListView({ el: $('#content') });
        this.navBar = new NavBar({ el: $('#sidebar') }).render();
       
        $(document).on('click', 'a:not(.data-bypass)', function (evt) {
            var href = $(this).attr('href');
            var protocol = this.protocol + '//';

            if (href.slice(protocol.length) !== protocol) {
                evt.preventDefault();
                self.navigate(href, true);
            }
        });
        Backbone.history.on("route", function (router, route) {
            if (route !== "list") {
                this.serverListView.stopRefresh();
            } else if (route !== "home") {
                this.homeView.stopRefresh();
            }
        }, this);
    },
    routes: {
        "": "home",
        "home": "home",
        "home/:id": "home",
        "serverlist": "list",
        "serverlist/:id": "list",
        "servers/:id": "serverDetails",
        "servers/:id/page/:page": "serverDetails",
        "player/:id": "playerDetails",
        "player/:id/page/:page": "playerDetails",
        "matches/:id": "matchDetails",
        "playersearch": "playerSearch",
        "playersearch/:id": "playerSearch",
        "manage": "manage",
        "manage/update/:id": "manageUpdateDefinition",
        "manage/copy/:id": "manageCopyDefinition",
        "*actions": 'home'
    },
    home: function (id) {
        if (id) {
            Static.gameId = parseInt(id) || 0;
        }
        this.homeView.id = Static.gameId;
        this.homeView.render();
    },
    list: function (id) {
        if (id && $.isNumeric(id)) {
            Static.gameId = parseInt(id);
        }
        this.serverListView.id = Static.gameId;
        this.serverListView.startRefresh();
        //this.serverListView.render();
    },
    playerSearch: function (id) {
        if (id) {
            var parsed = parseInt(id);
            if (parsed) {
                Static.gameId = parseInt(id);
            }
        }
        this.serverListView.stopRefresh();
        new PlayerSearchFormView({
            id: Static.gameId,
            el: $('#content')
        }).render();
    },
    serverDetails: function (id, page) {
        this.serverListView.stopRefresh();
        new ServerDetailView({
            model: new ServerDetails({ id: id }),
            
            el: $('#content')
        })
            .setParams({matchPageNumber: page})
            .render();
    },
    playerDetails: function (id, page) {
        this.serverListView.stopRefresh();
        new PlayerDetailView({
            model: new PlayerDetails({ PlayerId: id }),

            el: $('#content')
        })
            .setParams({ matchPageNumber: page })
            .render();

    },
    matchDetails: function (id) {
        this.serverListView.stopRefresh();
        new MatchDetailView({
            model: new Match({ MatchId: id }),
            el: $('#content')
        }).render();
    },
    manage: function(){
        this.serverListView.stopRefresh();
        new Manage({
            el: $('#content')
        }).render();
    },
    manageUpdateDefinition: function(id) {
        this.serverListView.stopRefresh();
        new ServerUpdateView({
            model: new ServerUpdate({ServerId: id}),
            el: $('#content')
        });
    },
    manageCopyDefinition: function(id) {
        this.serverListView.stopRefresh();
        new ServerUpdateView({
            model: new ServerUpdate({ServerId: id}),
            el: $('#content'),
            copy: true
        });
    },
});

var initialize = function () {
    var appRouter = new AppRouter;
    Backbone.history.start({ pushState: true });

    return appRouter;
}

module.exports = {
    initialize: initialize
};