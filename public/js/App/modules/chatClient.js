var $ = require('jquery');
var Static = require('./static');
var Base64 = require('./base64');

var token = 0;
var lastMessageId = 0;
var messageLog;
var title = document.title;
var blobCounter = 0;
var messageBox = null;
var level = 0;
var currentName = '';
//var nm = new nameMaker('/charsets/quake1/charset-1.png');

var sendRequest = function (object, callback, errorCallback) {
    var thisReference = this;
    $.ajax({
        url: "http://servers.quakeone.com/chat",
        contentType: 'application/json',
        dataType: 'json',
        type: "post",
        data: JSON.stringify(object),
        success: function (data) { callback.call(thisReference, data) },
        error: errorCallback
                ? function (data) { errorCallback.call(thisReference, data) }
                : function () {
                    //alert("failure");
                    $("#result").html('There is error while submit');
                }
    });
}
var chatClient = {
    initialized: false,
    options: {
        errorText: null,
        messageBox: null,
        newMessageBox: null,
        usersCallback: null
    },
    initialize: function (opt) {
        var self = this;
        $.extend(this.options, opt);

        if (this.options.messageBox === null) {
            return; // Need a messagebox to do anything useful.
        }

        window.onbeforeunload = function (e) {
            self.disconnectFromChat();
        }
        $(window).on('focus', function () {
            document.title = title;
        });
        $(document).on('keyup', function () {
            $('span.message.selected').each(function(idx,elem){
                self.removeMessage($(elem).attr('mid'));
            });
        });
        $(document).on("click", "span.message", function (e) {
            if (level > 1) {
                self.selectMessage($(e.target));
            }
            return false
        });
        $(document).on("click", "img", function (e) {
            if (level > 1) {
               
                var img = e.target;
                var span = $(img).closest("span.message");
                self.selectMessage(span);
            }
            return false
        });
        if (this.initialized) {
            this.refresh();
        } else {
            // initialize internal log structure
            this.clearMessageLog();
            $(this.options.messageBox).html();

            token = this.getCookieValue('usertoken');
            if (!token || token <= 0) {
                this.newUser(this.start);
            } else {
                this.start();
            }
            this.initialized = true;
        }
        this.setNameChangeHint();
    },
    setNameChangeHint: function () {
        var realName = Base64.decode(currentName);
        var newMessageBox = this.options.newMessageBox;
        if (realName.substring(0, 7) === "Random-"
            && newMessageBox) {
            $(newMessageBox).attr('placeholder', '/name <your name>');
        } else {
            $(newMessageBox).attr('placeholder', 'Message');
        }
    }
    ,
    selectMessage: function (span) {
        if (level > 1) {
            $('span.message.selected')
                .off('keyup')
                .removeClass('selected');
            if ($(span).attr('mid') > 0) {
                $(span).addClass('selected');
            }
        }
        return false;
    },
    removeMessage: function (messageId) {
        var request = {
            requestType: "removeMessage",
            data: {
                token: token,
                messageId: messageId
            }
        };
        // don't bother - server verifies level...
        sendRequest.call(this, request, function (response) {
            
        });
    },
    sendMessage: function (message) {
        if (message && message.length > 0) {
            if (message.substring(0, 1) == '/') {
                this.processMessageCommand(message);
            } else {
                this.sendMessageToServer(message);
            }
        }
    },
    newUser: function (callback) {
        var request = {
            requestType: "newUser",
            data: {
            }
        };

        sendRequest.call(this, request, function (response) {
            if (response.data.token) {
                this.setCurrentUser(response.data.name, response.data.token);
                if (response.status == 'success') {
                    if (callback)
                        callback.call(this);
                } else {
                    alert("Error connecting as a new user: " + response.error.message);
                }
            }
        });
    },
    setCurrentUser: function (name, newToken) {
        this.setCookieValue('usertoken', newToken);
        token = newToken;
        // set start message to name change
        currentName = name;

        var realName = Base64.decode(name);
        if (realName.substring(0, 7) === "Random-") {
            
            var newMessage = this.options.newMessageBox;
            if (!newMessage) return;

            newMessage.val('/name ' + realName);

            if (window.getSelection) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                var range = document.createRange();
                range.selectNodeContents(newMessage.get(0));
                sel.addRange(range);
            } else if (document.selection) {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(newMessage.get(0));
                textRange.select();
            }
        }
        this.setNameChangeHint();
    },

    start: function () {
        this.refresh(function (response) {
            if (response.status == 'failure') {
                // we can recover from code 3.
                if (response.error.code === 3) {
                    this.newUser(this.start);
                    return;
                } else {
                    alert(response.error.message);
                }
            } else {
                this.longPoll();
            }
        });
    },

    disconnectFromChat: function () {
        var request = {
            requestType: "disconnectUser",
            data: {
                token: token
            }
        };

        sendRequest.call(this, request, function (response) {
            // w/e
        });
    },
    changeName: function (name) {

        if (!token) return;

        var request = {
            requestType: "changeName",
            data: {
                token: token,
                name: Base64.encode(name)
            }
        };

        sendRequest.call(this, request, function (response) {
            if (response.status == 'success') {
                this.refresh();
            }
        });
    },
    sendMessageToServer: function (message) {
        var request = {
            requestType: "sendMessage",
            data: {
                token: token,
                message: message
            }
        };

        sendRequest.call(this, request, function (response) {
            // what do?
        });
    },
    refresh: function (callback) {
        var request = {
            requestType: "messagePoll",
            data: {
                token: token,
                lastMessageId: 0,
                refresh: true
            }
        };

        sendRequest.call(this, request, function (response) {
            if (response.status == 'success') {
                this.updateUsers(response.data.users);
                this.updateMessages(response.data.messages);
                this.removeMessages(response.data.removed);
                this.applyNameMaker();

                if (currentName != response.data.name) {
                    currentName = response.data.name;
                    this.setNameChangeHint();
                }
                level = response.data.level;
            }
            if (callback) {
                callback.call(this, response);
            }
        });
    },
    longPoll: function () {

        var request = {
            requestType: "messagePoll",
            data: {
                token: token,
                lastMessageId: lastMessageId,
                refresh: false
            }
        };
        
        sendRequest.call(this,
            request,
            function (response) {
                if (response.status == 'success') {

                    level = response.data.level;
                    if (response.data.users !== undefined) {
                        this.updateUsers(response.data.users);
                    }
                    if (response.data.refresh) {
                        this.redrawMessages(response.data.messages);
                    } else {
                        this.updateMessages(response.data.messages);
                    }
                    this.removeMessages(response.data.removed);
                    this.applyNameMaker();
                }
                this.longPoll();
            },
            function (response) { // error
                var self = this;
                self.setError('Connection Error, retrying in 10s');
                setTimeout(function () {
                    self.clearError();
                    self.longPoll();
                }, 10000);
                
            });
    },
    clearError: function(){
        if (this.options.errorText) {
            this.options.errorText.text('');
        }
    },
    setError: function(text){
        if (this.options.errorText) {
            this.options.errorText.text(text);
        }
    },
    processMessageCommand: function (message) {
        var split = message.split(' ');
        if (split.length > 1) {
            var command = split[0].toUpperCase();
            switch (command) {
                case '/NAME':
                case '/NICK':
                    var newName = message.substring(command.length + 1, message.length);
                    this.changeName(newName);
                    break;
            }

        }
    },
    clearMessageLog: function () {
        messageLog = {
            log: [],
            tip: {}
        };
    },
    appendMessage: function (message) {
        var now = new Date(message.date);
        var tooLong = new Date();
        tooLong.setTime((3 * 60000) + now.getTime());


        if (messageLog.tip.userId == message.userId
            && messageLog.tip.name == message.name
            && messageLog.tip.expires > now) {
            messageLog.tip.messageTip = message;
            messageLog.tip.expires = tooLong;
            messageLog.tip.messages.push({
                message: message.message,
                messageId: message.messageId
            });
        } else {

            messageLog.tip = {
                expires: tooLong,
                userId: message.userId,
                name: message.name,
                date: now,
                key: blobCounter++,
                messages: [{
                    message: message.message,
                    messageId: message.messageId
                }],
                messageTip: message
            }

            messageLog.log.push(messageLog.tip);
        }
    },
    removeMessages: function (messages) {
        for (var idx in messages) {
            var message = $('span.message[mid="' + messages[idx] + '"]')
            if (message.length > 0) {
                var parent = message.parent();
                //remove next or previous br
                var br = message.prev();
                if (br.length === 1 && br.prop("tagName").toLowerCase() === 'br') {
                    br.remove();
                } else {
                    var br = message.next();
                    if (br.length === 1 && br.prop("tagName").toLowerCase() === 'br') {
                        br.remove();
                    }
                }
                message.remove();

                if (parent.children().length <= 0) {
                    parent.prev().remove();// remove name div
                    parent.remove(); // remove this div
                }
            }
        }
    },
    updateUsers: function (users) {
        if (this.options.usersCallback) {
            this.options.usersCallback(users);
        }
        //var usersDiv = $('#users');
        //usersDiv.empty();
        //if (users.length > 0) {
        //    $.each(users, function (idx, elem) {
        //        if (elem.name) {
        //            usersDiv.append($('<div><canvas class="name-graphic" width="192" height="12" value="' + elem.name + '"></canvas></div>'));
        //        }
        //    });
        //}
    },
    redrawMessages: function (messages) {

        // make a local reference.
        var messageBox = this.options.messageBox;

        this.clearMessageLog();
        lastMessageId = 0;
        messageBox.empty();

        $.each(messages, function (idx, elem) {
            this.appendMessage(elem);
        });

        $.each(messageLog.log, function (idx, elem) {
            this.addMessageToBox(elem, messageBox);
        });
        // mmight need to wait for async..
        // setTimeout(function () {
        console.log(messageBox[0].scrollHeight);
        //}, 20);
        this.processMessageImagesInContainer(messageBox, messageBox);
        messageBox.scrollTop(messageBox[0].scrollHeight);

    },
    addMessageToBox: function (message, box) {
        var len = Base64.decode(message.name).length;

        box.append(
            $('<div/>')
            .append(this.getTime(message.date))
            .addClass("messageBlob")
            .append(
                $('<canvas class="name-graphic" width="' + (len * 12) + '" height="12" value="' + message.name + '"></canvas>'))
            .attr("style", "float: left; width:85%;"));

        var messageDiv = $('<div/>')
            .attr("style", "border:1px solid #dddddd;border-radius:4px;margin: 3px;padding: 3px;float: right; background-color: #f5f5f5; width:85%;")
            .attr("key", message.key);

        $.each(message.messages, function (idx, message) {
            if (idx > 0)
                messageDiv.append('<br>');
            messageDiv.append(
                $('<span class="message" mid="' + message.messageId + '">' + message.message + "</span>"));
        });

        box.append(messageDiv);

        return messageDiv;
    }
    ,getTime: function (date) {
        //var date = new Date(dateStr);
        var t = "AM";
        var minutes = date.getMinutes();
        if (minutes < 10)
            minutes = "0" + minutes;
        var hours = date.getHours();
        if (hours > 12) {
            hours = hours - 12;
            t = "PM";
        }

        return hours + ":" + minutes + " " + t + " ";
    } ,
    updateMessages: function (messages) {

        // make a local reference.
        var messageBox = this.options.messageBox;
        var self = this;
        if (messages && messages.length > 0) {
            $.each(messages, function (idx, elem) {
                if (elem.messageId > lastMessageId) {
                    lastMessageId = elem.messageId;
                    self.appendMessage(elem);
                }
            });
        } else {
            return;// nothing to do.
        }
        var lastDiv = $('div:last-child', messageBox);
        var lastSpan = $('span:last-child', lastDiv);

        var lastAddedMessageId = parseInt(lastSpan.attr('mid') || -1);
        var lastAddedBlobId = parseInt(lastDiv.attr('key') || -1);
        var workingBlob = null;

        $.each(messageLog.log, function (bdx, nameBlob) {
            if (nameBlob.key === lastAddedBlobId) {
                workingBlob = nameBlob;
                return false
            }
        });

        if (workingBlob) {
            var addedStuff = false;
            $.each(workingBlob.messages, function (idx, message) {
                if (message.messageId > lastAddedMessageId) {
                    lastDiv.append(
                        $('<br><span class="message" mid="' + message.messageId + '">' + message.message + "</span>"));

                    addedStuff = true;
                }
            });
            if (addedStuff) {
                $('img', lastDiv).each(function (idx, img) {
                    imageFunctions.makeImageZoomable(img);
                });
            }
        }


        $.each(messageLog.log, function (bdx, nameBlob) {
            if (nameBlob.key > lastAddedBlobId) {
                var div = self.addMessageToBox(nameBlob, messageBox);

                $('img', div).each(function (idx, img) {
                    imageFunctions.makeImageZoomable(img);
                });
            }
        });

        messageBox.scrollTop(messageBox[0].scrollHeight);
        this.processMessageImagesInContainers(messageBox);
    },
    processMessageImagesInContainers: function (messageBox) {
        var imageLoading = 0;
        $('img', messageBox).each(function (idx, img) {
            if (!img.complete) {
                imageLoading++;
                $(img).load(function () {

                    imageLoading--;
                    if (imageLoading <= 0) {
                        messageBox.scrollTop(messageBox[0].scrollHeight);
                    }
                });
            }
        });

        if (imageLoading == 0) {

            setTimeout(function () {
                messageBox.scrollTop(messageBox[0].scrollHeight);
            }, 60);
        }

    },
    trimString: function (str) {
        return str.replace(/^\s+|\s+$/g, ''); 
    }
    ,
    getCookieValue: function (key) {
        var keyValues = this.getCookies();
        return keyValues[key];
    },
    getCookies: function () {
        var allcookies = document.cookie;
        var cookiearray = allcookies.split(';');
        var keyValues = {};
        for (var i = 0; i < cookiearray.length; i++) {
            var split = this.trimString(cookiearray[i]).split('=');
            name = split[0];
            value = split[1];
            keyValues[name] = value;
        }
        return keyValues;
    },
    setCookieValue: function (key, value) {
        var cookie = key + "=" + value;
        document.cookie = cookie;
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
}

// Taken from Reddit Enhancement Suite - Because it's awesome
var imageFunctions = {
    dragTargetData: {
        //numbers just picked as sane initialization values
        imageWidth: 100,
        diagonal: 0, //zero to represent the state where no the mouse button is not down
        dragging: false
    },
    makeImageZoomable: function (imageTag) {
        imageTag.addEventListener('mousedown', imageFunctions.mousedownImage, false);
        imageTag.addEventListener('mouseup', imageFunctions.dragImage, false);
        imageTag.addEventListener('mousemove', imageFunctions.dragImage, false);
        imageTag.addEventListener('mouseout', imageFunctions.mouseoutImage, false);
        imageTag.addEventListener('click', imageFunctions.clickImage, false);

    },
    mousedownImage: function (e) {
        if (e.button === 0) {
            console.log("lll");
            if (!e.target.minWidth) e.target.minWidth = Math.max(1, Math.min(e.target.width, 100));
            imageFunctions.dragTargetData.imageWidth = e.target.width;
            imageFunctions.dragTargetData.diagonal = imageFunctions.getDragSize(e);
            imageFunctions.dragTargetData.dragging = false;
            imageFunctions.dragTargetData.hasChangedWidth = false;
            e.preventDefault();
        }
    },
    mouseoutImage: function (e) {
        imageFunctions.dragTargetData.diagonal = 0;
    },
    dragImage: function (e) {
        if (imageFunctions.dragTargetData.diagonal) {
            var newDiagonal = imageFunctions.getDragSize(e),
                oldDiagonal = imageFunctions.dragTargetData.diagonal,
                imageWidth = imageFunctions.dragTargetData.imageWidth,
                maxWidth = Math.max(e.target.minWidth, newDiagonal / oldDiagonal * imageWidth);

            imageFunctions.resizeImage(e.target, maxWidth);
            imageFunctions.dragTargetData.dragging = true;
        }
        //imageFunctions.handleSRStyleToggleVisibility(e.target);
        if (e.type === 'mouseup') {
            imageFunctions.dragTargetData.diagonal = 0;
        }
    },
    getDragSize: function (e) {
        var rc = e.target.getBoundingClientRect(),
            p = Math.pow,
            dragSize = p(p(e.clientX - rc.left, 2) + p(e.clientY - rc.top, 2), .5);

        return Math.round(dragSize);
    },
    clickImage: function (e) {
        imageFunctions.dragTargetData.diagonal = 0;
        if (imageFunctions.dragTargetData.hasChangedWidth) {
            imageFunctions.dragTargetData.dragging = false;
            e.preventDefault();
            return false;
        }
        imageFunctions.dragTargetData.hasChangedWidth = false;
    },
    resizeImage: function (image, newWidth) {
        var currWidth = $(image).width();
        if (newWidth !== currWidth) {
            imageFunctions.dragTargetData.hasChangedWidth = true;

            image.style.width = newWidth + 'px';
            image.style.maxWidth = newWidth + 'px';
            image.style.maxHeight = '';
            image.style.height = 'auto';

            var thisPH = $(image).data('imagePlaceholder');
            $(thisPH).width($(image).width() + 'px');
            $(thisPH).height($(image).height() + 'px');
        }
    }
}
module.exports = chatClient;
