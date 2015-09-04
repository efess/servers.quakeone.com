var db = require('./serversdb');
var errors = require('./errors');
var validator = require('validator');
var linkifyjs = require('linkifyjs');
var Promise = require('promise');
var r = require('ramda');
 
var room = {
    name: '',
    id: -1
};
 
var chatHistoryLimit = 100;
 
var chatLog = [];
var onlineUsers = [];
var removedMessagesHack = [];
var userCache = [];
 
var getUser = function (token, refresh) {
    var user = refresh ? null : userCache[token];
    if (!user) {
        return db.getUser(token, room.id)
            .then(function (dbUser) {
                // pevent random token
                if (dbUser) {
                    userCache[token] = dbUser;
                }
               
                return dbUser;
            });
    } else {
        return Promise.resolve(user);
    }
}
 
var notifyAllUsers = function (refresh) {
    for (var idx = onlineUsers.length - 1;
        idx >= 0;
        idx--) {
        if (onlineUsers[idx].callback && onlineUsers[idx].callback.length > 0) {
            for (var cdx = onlineUsers[idx].callback.length - 1;
                cdx >= 0;
                cdx--) {
                var callbackData = onlineUsers[idx].callback[cdx];
                if (refresh)
                    callbackData.refresh = refresh;
                onlineUsers[idx].callback.splice(cdx, 1);
 
                callbackData.callback();;
            }
        }
    }
}
 
var hashCode = function (s) {
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);             
}
 
var insertIntoLog = function(action, description, hostname){
    var now = new Date();
    db.insertIntoChatLog(now, action, hostname, description);
}
 
 
var processChatString = function (str) {
   
    str = str.substring(0, 2000);
    var escaped = validator.stripLow(str);
    var tokenizedUrls = [];
   
    var imageRegeEx = new RegExp('\.(?:jpe?g|gif|png)$', 'i');
    escaped = r.map(function(token){
        if(token.isLink) {
            var url = token.toHref('http');
            var urlToken = '__' + tokenizedUrls.length + '__'
            var formattedUrl = url;
            if (imageRegeEx.test(url)) {
                formattedUrl = '<img src="' + url + '" style="max-width: 290px; max-height: 240px;">';
            } else if(token.type === 'url') {
                formattedUrl = '<a href="' + url + '" target="_blank" class="data-bypass">' + url + '</a>'
            }
           
            tokenizedUrls.push({ token: urlToken, url: formattedUrl})
            return urlToken;
        } else {
            return token.toString();
        }
    }, linkifyjs.tokenize(escaped)).join('');
   
    escaped = validator.escape(escaped);
 
    escaped = escaped.replace(/\t/g, '    ')
           .replace(/  /g, '&nbsp; ')
           .replace(/  /g, ' &nbsp;') // handles "W&nbsp;  W"
           .replace(/\r\n|\n|\r/g, '<br>');
   
    escaped = r.reduce(function(aggr, tokenObj){
        return escaped.replace(tokenObj.token, tokenObj.url);
    }, escaped, tokenizedUrls);
   
    return escaped;
}
 
var chat = {
    initialize: function (roomName, callback) {
        return db.initializeRoom(roomName)
            .then(function(roomId) {
                room.id = roomId;
                room.name = roomName;
   
                return db.getChatMessages(room.id, chatHistoryLimit)
                    .then(function(result) {
                        for (var idx in result) {
                            chatLog.push({
                                messageId: result[idx].ChatMessageId,
                                message: result[idx].Message,
                                token: result[idx].Token,
                                chatUserId: result[idx].ChatUserId,
                                name: result[idx].Name.toString('base64'),
                                date: result[idx].Date
                            });
                        }
                    }, function(err) {
                        insertIntoLog('initalizeRoom', 'error loading messages: ' + err, null);
                    });
            },
            function(err){
                insertIntoLog('initalizeRoom', 'error initializing room (' + roomName + '): ' + err, null);
            });
    },
    removeMessage: function (token, messageId, ipaddress) {
        for (var idx in removedMessagesHack) {
            if (removedMessagesHack[idx].messageId === messageId) {
               
                return Promise.resolve('Already removed');
            }
        }
        return getUser(token).then(function(user){
            if(!user) {
                console.log("user not found for message. token: " + token);
               
                return errors.userNotFound();
            }
   
            if (user.UserLevel < 2) { // 2 is moderator.
                insertIntoLog('removeMessage', "user " + user.Name.toString() + " does not have appropriate user level to remove messages. token: " + token, ipaddress);
                console.log("user " + user.Name.toString() + " does not have appropriate user level to remove messages. token: " + token);
               
                return errors.insufficientUserLevelError();
            }
           
            return db.setRemovedOnMessage(messageId)
                .then(function(){
                    for (var i = chatLog.length - 1; i >= 0; i--) {
                        if (chatLog[i].messageId.toString() === messageId) {
                            removedMessagesHack.push({
                                messageId: messageId,
                                expires: new Date(new Date().getTime() + 1 * 45000)
                            });
                            chatLog.splice(i, 1);
                            notifyAllUsers();
                           
                            return;
                        }
                    }
                });
        });
    },
    requestMessageRemovals: function () {
        var removedMessages = [];
        var now = new Date();
        for (var i = removedMessagesHack.length - 1;
            i >= 0;
            i--) {
            if (removedMessagesHack[i].expires < now) {
                removedMessagesHack.splice(i, 1);
            } else {
                removedMessages.push(removedMessagesHack[i].messageId);
            }
        }
        return removedMessages;
    },
    requestMessages: function (lastMessageId) {
        return new Promise(function(resolve, reject){
            var returnLog = [];
   
            var doChatLog = function (idx) {
                if(idx >= chatLog.length){
                    resolve(returnLog);
                    return;
                }
                var msg = chatLog[idx];
                if (lastMessageId
                    && msg.messageId <= lastMessageId) {
                    doChatLog(++idx);
                } else {
                    getUser(msg.token, false)
                        .then(function (user) {
                            if (user) {
                                returnLog.push({
                                    date: msg.date,
                                    name: msg.name,
                                    userId: user.ChatUserId, // expose to outside as just UserId
                                    message: msg.message,
                                    messageId: msg.messageId
                                });              
                            } else {
                                console.log("user not found for message. token: " + msg.token);
                            }
               
                            doChatLog(++idx);
                        }, function(err) {
                            reject(err);
                        });               
                }           
            };
           
            doChatLog(0);
        });
    },
    requestUsers: function () {
        var returnUsers = [];
        return new Promise(function(resolve, reject) {
               
            var gatherUsers = function (idx) {
                if (idx >= onlineUsers.length) {
                    resolve(returnUsers);
                } else {
                    var user = onlineUsers[idx];
           
                    getUser(user.token, false)
                        .then(function (dbUser) {
                            returnUsers.push({
                                name: dbUser.Name.toString('base64'),
                                level: 0
                            });
               
                            gatherUsers(++idx);
                    }, function(err) {reject(err);});         
                }   
            }
           
            gatherUsers(0);
        })
    },
    updateName: function (token, name, ipaddress) {
        return getUser(token, false).then(
            function (user) {
                if (!user) {
                    return Promise.reject(errors.userNotFound());
                }
                var namebuffer = new Buffer(name, 'base64');
                var length = Buffer.byteLength(name, 'base64');
               
                // verify name is ok
                if (length <= 0 || length > 16) {
                    insertIntoLog('changeName', 'name change requested with invalid length: ' + length, ipaddress);
                    return Promise.reject(errors.invalidNameLength());
                }
       
                return db.updateUser(
                    user.ChatUserId,
                    namebuffer,
                    ipaddress)
                    .then(function(rows){
                        insertIntoLog('changeName', 'changing name from ' + user.Name.toString() + ' to ' + namebuffer.toString(), ipaddress);
                        user.Name = namebuffer;
                        var nameBase64 = user.Name.toString('base64');
                       
                        for (var idx = onlineUsers.length - 1; idx >= 0; idx--) {
                            if (onlineUsers[idx].token === token) {
                                onlineUsers[idx].name = nameBase64;
                            };
                        }
       
                        notifyAllUsers();
                        return nameBase64;
                    }, function(err){
                        console.log(err);
                        insertIntoLog('changeName', 'error changing name: ' + err, ipaddress);
                        return errors.dataOperationError();
                    })
            });
    },
    // disconnectUser: function (token) {
    //     var workDone = false;
    //     for (var idx = onlineUsers.length - 1; idx >= 0; idx--) {
    //         if (onlineUsers[idx].token === token) {
    //             onlineUsers.splice(idx, 1);
    //             workDone = true;
    //             break;
    //         };
    //     }
   
    //     if(workDone)
    //         notifyAllUsers();
    // },
    createNewUser: function (ipaddress, sessionToken) {
        var name = "Random-" + Math.floor((Math.random() * 10000) + 1);
        var bufferName = new Buffer(name);
        var base64Name = bufferName.toString('base64');
       
        return db.insertIntoUser(bufferName, ipaddress, sessionToken).then(function(){
            insertIntoLog('createNewUser', 'Created new user with name ' + name, ipaddress);
            return base64Name;
        }, function(err){
            insertIntoLog('createNewUser', 'error creating new user: ' + err, ipaddress);
            return errors.dataOperationError();
        });
    },
    // HOLY SHIT This is terrible code. WHAT WAS I THINKING
    connectUser: function (errorCallback, cbData) {
        var onlineUser = null;
        var now = new Date();
        var onlineUserListChanged = false;
        var token = cbData.token;
   
        // update expiration for our connecting user
        var newExpiration = new Date(now.getTime() + 1 * 45000);
   
        // remove expired users.
        for (var idx = onlineUsers.length - 1; idx >= 0; idx--){
            if (onlineUsers[idx].token === token) {
                onlineUser = onlineUsers[idx];
            } else if (onlineUsers[idx].expires < now
                && onlineUsers[idx].token != token) {
                insertIntoLog('connectUser', "disconnecting an old user, token: " + onlineUsers[idx].token, cbData.ipaddress);
                console.log('found expired user: ' + onlineUsers[idx].token + ' removing from list');
                onlineUsers.splice(idx, 1);
                onlineUserListChanged = true;
            };
        }
   
        if (!onlineUser) {
            getUser(token, false)
                .then(function(maybeDbUser){
                    if(maybeDbUser){
                        return maybeDbUser;
                    } else {
                        return chat.createNewUser(cbData.ipaddress, token)
                            .then(function(){
                                return getUser(token, false);
                            })  
                    }
                })
                .then(function (dbUser) {
                    if (!dbUser) {
                        return errors.userNotFoun();
                    }
   
                    // after retrieving user, another request may have already
                    // pushed. Lets just make sure.
                   
                    for (var idx in onlineUsers) {
                        if (onlineUsers[idx].token == token) {
                            onlineUser = onlineUsers[idx];
                            break;
                        }
                    }
                    if (!onlineUser) {
                        onlineUser = {
                            callback: [],
                            token: token,
                            name: dbUser.Name.toString('base64'),
                            userLevel: dbUser.UserLevel,
                            chatUserId: dbUser.ChatUserId
                        }
                        onlineUsers.push(onlineUser);
                        onlineUserListChanged = true;
                    }
   
                    onlineUser.expires = newExpiration;
                    cbData.responseData.data.level = onlineUser.userLevel;
                    cbData.responseData.data.name = onlineUser.name;
   
                    if (cbData.refresh
                        || onlineUserListChanged) {
                        cbData.callback();
                    } else {
   
                        cbData.timeoutId = setTimeout(function (cb) {
                            for (var i in onlineUsers) {
                                for (var j in onlineUsers[i].callback) {
                                    if (onlineUsers[i].callback[j].timeoutId == cb.timeoutId) {
                                        onlineUsers[i].callback.splice(j, 1);
                                        cb.callback();
                                        return;
                                    }
                                }
                            }
                        }, 30000, cbData);
                        onlineUser.callback.push(cbData);
                    }
   
                    insertIntoLog('connectUser', "Adding to online users:  " + dbUser.Name.toString() + ", Token: " + token + ", users currently online: " + onlineUsers.length, cbData.ipaddress);
                    console.log('(JustCameOnline) - tokenId: ' + token + ' notifyusers: ' + (onlineUserListChanged ? "true" : "false"));
                    if (onlineUserListChanged)
                        notifyAllUsers();
                });
        } else {
            console.log('(OnlineUser) - tokenId: ' + token + ' notifyusers: ' + (onlineUserListChanged ? "true" : "false"));
           
            if (onlineUserListChanged)
                notifyAllUsers();
   
            onlineUser.expires = newExpiration;
            cbData.responseData.data.level = onlineUser.userLevel;
            cbData.responseData.data.name = onlineUser.name;
   
            if (cbData.refresh
                || onlineUserListChanged) {
                cbData.callback();
            } else {
                cbData.timeoutId = setTimeout(function (cb) {
                    for (var i in onlineUsers) {
                        for (var j in onlineUsers[i].callback) {
                            if (onlineUsers[i].callback[j].timeoutId == cb.timeoutId) {
                                onlineUsers[i].callback.splice(j, 1);
                                cb.callback();
                                return;
                            }
                        }
                    }
                }, 30000, cbData);
                onlineUser.callback.push(cbData);
            }
        }
    },
    disconnectUser: function (token, callback) {
        var onlineUserListChanged = false;
        for (var idx = onlineUsers.length - 1; idx >= 0; idx--) {
            if (onlineUsers[idx].token === token) {
                onlineUsers.splice(idx, 1);
                onlineUserListChanged = true;
            };
        }
   
        if (onlineUserListChanged)
            notifyAllUsers();
   
        callback(null);
    },
    addNewMessage: function (token, message, ipaddress) {
   
        var message = processChatString(message);
        var date = new Date();
   
        return getUser(token, false)
            .then(function (user) {
                if (!user) {
                    return Promise.reject(errors.userNotFound());
                }
               
                return db.insertIntoChat(user.ChatUserId, user.Name, room.id, message, date)
                    .then(function (messageId) {
                        var newLogMessage = {
                            messageId: messageId,
                            message: message,
                            token: token,
                            chatUserId: user.ChatUserId,
                            name: user.Name.toString('base64'),
                            date: date
                        };
           
                        chatLog.push(newLogMessage);
           
                        while (chatLog.length > chatHistoryLimit) {
                            chatLog.splice(0, 1);
                        }
           
                        notifyAllUsers();
           
                        return messageId;
                    }, function(err){
                       
                        console.log("error inserting into chat: " + err);
                        return errors.dataOperationError();
                    });
   
        });
    }
}
module.exports = chat;