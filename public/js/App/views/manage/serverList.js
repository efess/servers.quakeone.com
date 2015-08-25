var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var ServerDefinitions = require('../../models/serverDefinitions');
var ServerDefinition = require('../../models/serverDefinition');

var ManageServerListView  = Backbone.View.extend({

    tagName: 'table',
    timerIntervalId: 0,
    initialize: function () {
        this.model = new ServerDefinitions();
        this.model.on('change', this.render, this);
    },
    template: _.template($('#manage-servers-list').html()),
    templateRow: _.template($('#manage-servers-list-row').html()),
    render: function (eventName) {
        var view = this;
        if (!this.model.has('serverDefinitions')) {
            view.model.fetch();
        } else {
             $(this.el).html(this.template(this.model.toJSON()));
            
            var $tableBody = $('#manageServersBody');
            
            $('#confirm-remove').on('show.bs.modal', function(e) {
                var serverId = $(e.relatedTarget).attr('sid');
                $('#confirm-server-id').text(serverId);
                
                var $dialog = $(this);
                $dialog.find('.btn-ok').one('click', function(){
                    
                    var model = new ServerDefinition({ServerId: serverId});
                    model.destroy({success: function(model, response) {
                        $('#confirm-remove').modal('hide');
                        setTimeout(function(){ view.model.fetch(); }, 500);
                    }});
                })
            });
            var servers = this.model.get('serverDefinitions');
            
            // var sortedServers = _.sortBy(servers, function (elem) {
            //     return elem.QueryResult;
            // });
            
            _.each(servers, function (server) {
                var rowData = $.extend({}, server,{
                    Game: this.transforms.GameId(server.GameId),
                    Status: this.transforms.Status(server.QueryResult),
                });
                $tableBody.append(this.templateRow(rowData));
            }, this);
        }
        return this;
    },
    transforms: {
        GameId: (function() {
            var _map = {
                0: 'NetQuake',
                1: 'QuakeWorld',
                2: 'Quake2',
                3: 'Quake3',
                4: 'Quake4'
            }
            return function(id){
                return _map[id] || 'Unknown';
            }
        }()),
        Status: (function() {
            var _map = {
                0: 'Running',
                1: 'NotResponding',
                2: 'NotFound'
            }
            return function(id){
                return _map[id] || 'Unknown';
            }
        }())
    },
    add: function(){
        
    },
    update: function(){
        
    },
    remove: function(){
        
    }
});

module.exports = ManageServerListView;
