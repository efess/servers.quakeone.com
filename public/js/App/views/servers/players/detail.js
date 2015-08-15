// TODO?

// define([
//   'jquery',
//   'underscore',
//   'backbone',
//   'models/playerdetail'
// ], function ($, _, Backbone,
//     ServerDetail,
//     ServerStats) {
//     ServerDetailView = Backbone.View.extend({

//         tagName: 'div',
//         template: _.template($('#server-details').html()),
//         render: function (eventName) {

//             this.getSubordinates();
//             $(this.el).html(this.template(this.model.toJSON()));
//             return this;
//         }
//     });

//     return ServerDetailView;
// });