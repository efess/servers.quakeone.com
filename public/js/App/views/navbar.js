var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../modules/static');

var NavBar = Backbone.View.extend({
    initialize: function () {
        Backbone.history.on("route", this.onNavigate, this);
    },
    onNavigate: function ( router, route) {
        var section = _.findWhere(this.sections, { route: route });
        if (section) {
            this.activeSection = section.navigate;
            this.render();
        }
    },
    activeSection: '',
    supportedGames: [{
        name: 'Net Quake',
        id: 0
    },{
        name: 'Quake World',
        id: 1
    }],
    sections: [{
        navigate: "home",
        route: "home",
        name: "Home"
    }, {
        navigate: "serverlist",
        route: "list",
        name: "Server List"
    }, {
        navigate: "playersearch",
        route: "playerSearch",
        name: "Player Search"
    }],
    links: [{
        href: "http://www.quakeone.com/",
        name: "QuakeOne.com"
    }],
    dropDown: _.template($('#navdropdown').html()),
    render: function (eventName) {
        $(this.el).empty();

        self = this;
        var ul = $('<ul/>')
            .addClass("nav")
            .addClass("nav-stacked nav-pills");

        for(var secIdx in this.sections){
            var section = this.sections[secIdx];
            var il = $('<li class="nav-item"/>')
                .append($('<a/>')
                    .addClass('nav-link')
                    .prop("href",section.navigate)
                    .text(section.name));

            if(section.navigate === this.activeSection){
                il.addClass('active');
            }
            ul.append(il);
        }

        var dropDownList = $('<ul/>')
            .addClass('dropdown-menu');
        var link = this.activeSection ? this.activeSection : 'home';
        var currentSelection = null;
        _.each(this.supportedGames, function (elem, idx) {
            if (elem.id === Static.gameId) {
                currentSelection = elem.name;
            }
            dropDownList.append($('<li class="nav-item"><a href="/' + link + '/' + elem.id + '" class="nav-link">' + elem.name +'</a></li>'))
        });

        ul.append($('<li class="dropdown nav-item"/>')
            .append($('<a/>')
                .attr('href', '/#')
                .addClass('dropdown-toggle')
                .addClass('data-bypass')
                .addClass('nav-link')
                .attr('data-toggle', 'dropdown')
                .text(currentSelection)
                .append($('<b class="caret"/>')))
            .append(dropDownList));

        //ul.append(this.dropDown());
        ul.append($('<li>&nbsp;</li>'));

        for(var linkIdx in this.links){
            var link = this.links[linkIdx];
            var il = $('<li class="nav-item"/>')
                .append($('<a/>')
                    .prop('href', link.href)
                    .addClass('data-bypass')
                    .addClass('nav-link')
                    .prop('target', '_blank')
                    .text(link.name));

            ul.append(il);
        }
        $(this.el).append(ul);

        return this;
    }
})

module.exports = NavBar;
