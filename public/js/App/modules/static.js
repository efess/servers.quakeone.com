var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var NameMaker = require('./nameMaker');

var Static = {  
    initialize: function () {
        // put this here.. for now..
        this.nameMaker = new NameMaker('public/content/charsets/quake1/charset-1.png')
        
    },
    serverRoot: "http://localhost:8080",
    gameId: 0

}

module.exports = Static;
