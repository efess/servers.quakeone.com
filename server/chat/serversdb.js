var db = require('../db');
var Promise = require('promise');
var r = require('ramda');

// var mysql = require('mysql');
// var pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'guitarchairwindow',
//     database: 'servers'
// });

//exports.updateChatUser = function(userId, ipAddress, 
exports.insertIntoChat = function (userId, name, roomId, message, date) {
    var newRow = {
        Date: date,
        Message: message,
        ChatUserId: userId,
        ChatRoomId: roomId,
        Name: name
    };

    return db.query('INSERT INTO ChatMessage SET ?', newRow)
        .then(r.prop('insertId'));
}

exports.insertIntoUser = function (name, ipaddress, sessionToken) {
    var newRow = {
        Name: name,
        IPAddress: ipaddress,
        Token: sessionToken
    };
    return db.query('INSERT INTO ChatUser SET ?', newRow)
        .then(r.prop('insertId'));;
}

exports.setRemovedOnMessage = function (messageId) {
    return db.query('UPDATE ChatMessage SET Removed = 1 WHERE ChatMessageId = ?', [messageId]);
}

exports.insertIntoChatLog = function (date, action, hostname, description) {
    var newRow = {
        Date: date,
        Action: action,
        HostName: hostname,
        Description: description
    };
    return db.query('INSERT INTO ChatLog SET ?', newRow)
        .then(r.prop('insertId'));;
}

exports.updateUser = function (userId, name, IPAddress) {
    return db.query('UPDATE ChatUser SET Name = ?, IPAddress = ? WHERE ChatUserId = ?', [name, IPAddress, userId]);
}

exports.getUser = function (token, roomId) {
    return db.query('SELECT * FROM vChatUser WHERE Token = ? AND ChatRoomId = ?', [token, roomId])
        .then(r.head);
}


exports.getChatMessages = function (roomId, count) {
    return db.query('SELECT * FROM (SELECT * FROM vChatMessages WHERE ChatRoomId = ? AND (Removed IS NULL || Removed = 0) ORDER BY ChatMessageId DESC LIMIT ?) as Sub ORDER BY ChatMessageId',
         [roomId, count]);

}

exports.initializeRoom = function (roomName) {
    if(!roomName){
        return Promise.reject('Room not specified');
    }
    
    return db.query('SELECT * FROM ChatRoom WHERE Name = ?', [roomName])
        .then(function(result){
            if(!result.length) {
                var newRoom = {
                    Name: roomName
                };
                return db.query('INSERT INTO ChatRoom SET ?', newRoom)
                    .then(r.compose(r.prop('insertId'), r.head));
            } else {
                return result[0].ChatRoomId;  
            } 
        });

}