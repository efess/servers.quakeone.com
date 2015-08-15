var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Router = require('./router');
var Static = require('./modules/static');

var initialize = function () {
    Static.initialize();
    // Pass in our Router module and call it's initialize function
    Router.initialize();
};

module.exports = {
    initialize: initialize
};