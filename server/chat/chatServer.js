var chat = require('./chat');
var errors = require('./errors');
var express = require('express')
  , router = express.Router();
  
// Room vars
var roomName = "Test Chat";
//var http = require('http');



//app.use(express.bodyParser());

// app.all('*', function (req, res, next) {
//     if (!req.get('Origin')) return next();
//     // use "*" here to accept any origin
//     res.set('Access-Control-Allow-Origin', 'http://qsb.selfip.org');
//     res.set('Access-Control-Allow-Methods', 'GET, POST');
//     res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
//     // res.set('Access-Control-Allow-Max-Age', 3600);
//     if ('OPTIONS' == req.method) return res.send(200);
//     next();
// });

router.post('/', function (req, res) {
    var ip = req.get('X-Real-IP') || req.connection.remoteAddress;
    req.connection.realIp = ip;
    console.log(ip + ' - ' + req.body.requestType);
    
    switch (req.body.requestType) {
        case "newUser":
            newUser(req, res);
            return;
        case "changeName":
            changeName(req, res);
            return;
        case "messagePoll":
            longPoll(req, res);
            return;
        case "sendMessage":
            sendMessage(req, res);
            return;
        case "disconnectUser":
            disconnectUser(req, res);
            return;
        case "removeMessage":
            removeMessage(req, res);
            return;

    }
    res.send("no data");
});

module.exports = router

var removeMessage = function (request, response) {
    var requestData = request.body.data;
    var token = request.sessionID;
    
    var respObject = {
        responseType: "removeMessage",
        data: {
        },
        status: "success"
    };

    chat.removeMessage(
        token,
        requestData.messageId,
        request.connection.realIp)
        .then(function(respObject){
            response.json(respObject);
            response.end();
        }, function(err){
            respObject.error = err;
            respObject.status = 'failure'            
        });
}

var changeName = function (request, response) {
    var requestData = request.body.data;
    var sessionId = request.sessionID;
    
    
    var respObject = {
        responseType: "changeName",
        data: {
        },
        status: "success"
    };

    chat.updateName(
        sessionId,
        requestData.name,
        request.connection.realIp)
        .then(function(name){
            request.session.chatUser = name;
            response.json(respObject);
            response.end();
            
        },function(err){
            respObject.status = 'failure';
            respObject.error = err;
            response.json(respObject);
            response.end();
        });
}

// Didn't refactor this to use Promise
var disconnectUser = function (request, response) {
    
    var token = request.sessionID;
    
    chat.disconnectUser(token, function (err) {

        var respObject = {
            responseType: "disconnectUser",
            data: {
            },
            status: "success"
        };
        if (err) {
            respObject.status = 'failure';
            respObject.error = err;
        }
        // return, but doubt anyone cares.
        response.json(respObject);
        response.end();
    });
}

var sendMessage = function (request, response) {
    var requestData = request.body.data;
    var token = request.sessionID;
    var respObject = {
        responseType: "sendMessage",
        data: {
        },
        status: "success"
    };

    chat.addNewMessage(
        token,
        requestData.message,
        request.connection.realIp)
        .then(function(messageId){
            respObject.data.messageId = messageId;
            response.json(respObject);
            response.end();
        }, function(err){
            respObject.status = 'failure';
            respObject.error = err;
            response.json(respObject);
            response.end();            
        });
}

var newUser = function (request, response) {
    var sessionToken = request.sessionID
    
    var respObject = {
        responseType: "newUser",
        data: {
        },
        status: 'success'
    }
    
    chat.createNewUser(request.connection.realIp, sessionToken)
        .then(function(name) {
            respObject.data = {name: name};
            response.json(respObject);
            response.end();
        }, function(err){
            respObject.status = 'failure';
            respObject.error = err;
            response.json(respObject);
            response.end();
        });
}

var longPoll = function (request, response) {
    var requestData = request.body.data;
    var token = request.sessionID;
    
    if (requestData === null) {
        response.end();
    }
    // if(!requestData.token){
    //     respObject.status = "failure";
    //     respObject.error = errors.userNotSpecified();
    //     response.json(respObject);
    //     response.end();
    // }
    
    var respObject = {
        responseType: "messagePoll",
        data: {
            messages: [],
            refresh: requestData.refresh,
            level: request.session.user ? 3 : 0
        },
        status: 'success'
    }
    
    var callbackData = {
        token: token,
        refresh: requestData.refresh,
        lastMessageId: requestData.lastMessageId,
        responseData: respObject,
        response: response,
        ipaddress: request.connection.realIp,
        //timeout: function () {
        //    this.response.json(this.responseData);
        //    this.response.end();
        //},
        callback: function () {
            var myself = this;
            chat.requestUsers()
                .then(function(userList) {
                    myself.responseData.data.users = userList;
                    return true;
                }).then(function() {
                    return chat.requestMessages(requestData.lastMessageId)
                        .then(function (messages) {
                        
                            myself.responseData.data.removed = chat.requestMessageRemovals();
                            myself.responseData.data.messages = messages;
            
                            myself.response.json(myself.responseData);
                            myself.response.end();
                        });
                });
        }
    };            

    chat.connectUser(function(err, cbData){
            console.log("Error: ", err.message)

            cbData.responseData.status = "failure";
            cbData.responseData.error = err;
            cbData.response.json(respObject);
            cbData.response.end();
        },
        callbackData);
}
