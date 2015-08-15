define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {

    var Static = {
        initialize: function () {
            // put this here.. for now..
            this.nameMaker = new NameMaker('/public/content/charsets/quake1/charset-1.png')
        }
    }
    return Static;
});