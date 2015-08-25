var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var ServerDefinition = require('../../models/serverDefinition');

var ManageServerListView  = Backbone.View.extend(
    (function(){
        var selectValues= {
            gameType: {
                '0': 'Net Quake',
                '1': 'QuakeWorld',
                '2': 'Quake2',
                '3': 'Quake3',
                '4': 'Quake4',
            },
            region: {
                'UnitedStates': 'USA',
                'Europe': 'Europe',
                'Brazil': 'Brazil'
                
            },
            status: {
                '0': 'OK',
                '1': 'Not Responding',
                '2': 'Not Found'
            },
        };
        return {
            tagName: 'table',
            timerIntervalId: 0,
            initialize: function (options) {
                this.copy = options.copy;
                this.model.on('change', this.render, this);
                if(this.model.id){
                    this.model.fetch();
                    
                }
            },
            template: _.template($('#manage-servers-add-update').html()),
            render: function (eventName) {
                var view = this;
                $(this.el).html(this.template(this.model.toJSON()));
                if(view.copy || view.add){
                    this.model.set({ServerId: null});
                    $('#serverUpdate').text('Copy');
                }
                $('#serverUpdate').on('click', function(e){
                    var serverData = {};
                    $.each($('#updateForm').serializeArray(), function(i, elem) {
                        serverData[elem.name] = elem.value;
                    });
                    view.model.set(serverData);
                    view.model.save({}, {
                        success: function(model, response, options) {
                            var result = response.affectedRows === 1 ?
                                "Update Success" :
                                "No rows updated";
                                
                            $('#update-result').text(result); 
                        }});
                    
                    e.preventDefault();
                });
                this.addItemsToSelect(selectValues.gameType, '#upGameType', this.model.get('GameId'));
                this.addItemsToSelect(selectValues.region, '#upRegion', this.model.get('Region'));
            },
            addItemsToSelect: function(values, selectSelector, valueToSelect){
                var $select = $(selectSelector);
                $.each(values, function(key, value) {   
                    var option = $("<option></option>")
                        .attr("value",key)
                        .text(value);
                    if(valueToSelect.toString() === key){
                        option.prop('selected', true);
                    }
                    $select.append(option);
                });
            }
        }
    }())
);

module.exports = ManageServerListView;
