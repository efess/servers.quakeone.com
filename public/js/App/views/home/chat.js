var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
window.$ = $;
window.jQuery = $;
var Static = require('../../modules/static');
var DateTime = require('../../modules/datetime');
var ChatClient = require('../../modules/chatClient');
require('bootstrap');

var ChatView = Backbone.View.extend({
    chatClient: null, //initialized in initialize
    initialize: function () {
        this.model.on('change', this.render, this);
    },
    params: {
        showChat: true
    },
    events: {
        'keyup textarea#newMessage': 'submitKeyUp',
        'click button#submitMessage': 'submitClick',
        'click a#toggleChat': 'toggleChat'
    },
    tagName: 'div',
    template: _.template($('#home-chat').html()),
    render: function () {
        var self = this;
        $(this.el).html(this.template(this.params));
        this.chatClient = ChatClient;
        this.chatClient.initialize({
            messageBox: $('#messages'),
            newMessageBox: $('#newMessage'),
            usersCallback: _.bind(this.userListUpdated, this),
            errorText: $('#chatError')
        });


        if (this.params.showChat) {
            $('#chatBody').show();
        } else {
            $('#chatBody').hide();
        }
        $('#userSpan').popover({
            html: true,
            content: function () {
                var div = $('<div/>');
                $.each(self.currentUserList, function (idx, elem) {
                    if (elem.name) {
                        div.append($('<div><canvas class="name-graphic" width="192" height="12" value="' + elem.name + '"></canvas></div>'));
                    }
                });
                return div;
            },
            trigger: 'hover'
        });
        $('#userSpan').on('shown.bs.popover', function () {
            self.applyNameMaker();
        })
        var html = "";

        //if (this.model.has('chat')) {
        //    var matches = this.model.get('chat');
        //    var modelData = $.extend(true, {}, matches.toJSON());
        //    $(this.el).html(this.template(modelData));

        //} else {
        //    // model is fetched by parent.
        //    $(this.el).html(this.template());
        //}

        return this;
    },
    currentUserList: [],
    submitClick: function (e) {
        var message = $.trim($('#newMessage').val());
        this.chatClient.sendMessage(message);
        $('#newMessage').val('');
        return false;
    },
    submitKeyUp: function(e) {
        if (e.keyCode == 13) {
            this.submitClick();
        }
    },
    userListUpdated: function (users) {
        $('#userCount').text(users.length);
        this.currentUserList = $.extend(true,{},users);
    },
    toggleChat: function (e) {
        if (!this.params.showChat) {
            $('#chatBody').show();
            $('#toggleChat').text('disable');
        } else {
            $('#chatBody').hide();
            $('#toggleChat').text('enable');
        }
        this.params.showChat = !this.params.showChat;

        return false;
    },
    applyNameMaker: function () {

        $.each($('.name-graphic'), function (i, canvas) {

            if (canvas.getContext) {
                var base64 = $.attr(canvas, 'value');
                if (base64 !== undefined &&
                    base64 !== null && base64 !== '') {

                    var ctx = canvas.getContext("2d");
                    var size = Static.nameMaker.writeName(ctx, base64, canvas.height);
                    //              
                }
            }
        });
    }
});

module.exports = ChatView;
