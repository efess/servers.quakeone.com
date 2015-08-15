// require.config({
//     //By default load any module IDs from js/lib
//     baseUrl: '/js/App',
//     //except, if the module ID starts with "app",
//     //load it from the js/app directory. paths
//     //config is relative to the baseUrl, and
//     //never includes a ".js" extension since
//     //the paths config could be for a directory.
//     paths: {
//         jquery: '../Libs/jquery-2.0.3',
//         underscore: '../Libs/underscore',
//         backbone: '../Libs/backbone',
//         bootstrap: "../Libs/bootstrap/js/bootstrap",
//         flot: "../Libs/jquery.flot",
//         flotValueLabels: "../Libs/jquery.flot.valuelabels"
//     },
//     shim: {
//         'backbone': {
//             //These script dependencies should be loaded before loading
//             //backbone.js
//             deps: ['underscore', 'jquery'],
//             //Once loaded, use the global 'Backbone' as the
//             //module value.
//             exports: 'Backbone'
//         },
//         'underscore': {
//             exports: '_'
//         },
//         'bootstrap': {
//             deps: ['jquery'],
//             exports: '$.fn.popover'
//         },
//         'flot': {
//             deps: ['jquery']
//         },
//         'flotValueLabels': {
//             deps: ['flot']
//         }
//     },
//     urlArgs: "bust=v22"
// });

var App = require('./app');
// Start the main app logic.
App.initialize();