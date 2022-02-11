var db = require('../db');
var cache = require('../cache');
var Promise = require('promise');
var r = require('ramda');
var util = require('../helpers/util')


var match = {
    recentMatches: (function(){
        var fieldMap = util.fieldMap({
            "MatchId": "ServerMatchId",
            "ServerId": "ServerId",
            "HostName": "HostName",
            "Port": "Port",
            "Map": "Map",
            "Mod": "Modification",
            "MatchDuration" : "Duration",
            "MatchEndAgo": "MatchEndAgo",
            "PlayerCount": "PlayerCount"
        });
        
        return function(gameId) {
            return cache.cacheableFn(function() {
                return db.query('CALL spServerRecentMatches(?)', gameId)
                                .then(r.head)
                                .then(r.map(fieldMap));
            },
            'recentMatches-' + gameId,
            15000);
        };
    }()),
    detail: (function(){
        var playerMap = util.fieldMap({
            "AliasBase64": "AliasBytes",
            "PlayerId": "PlayerId",
            "PlayerStayDuration": "PlayerStayDuration",
            "PlayerMatchStart": "PlayerMatchStart",
            "PlayerMatchEnd": "PlayerMatchEnd",
            "Skin": "Skin",
            "Model" : "Model",
            "PantColor": "PantColor",
            "ShirtColor": "ShirtColor",
            "FPM": "FPM",
            "Frags": "Frags"
        });
        
        var matchMap = util.fieldMap({
            "GameId": "GameId",
            "MatchId": "MatchId",
            "ServerId": "ServerId",
            "HostName": "HostName",
            "ServerName": "ServerName",
            "Map": "Map",
            "Mod" : "Modification",
            "MatchStart": "MatchStart",
            "MatchEnd": "MatchEnd",
            "MatchDuration": "MatchDuration"
        });
        
        return function(matchId) {
            return db.query('CALL spMatchDetail(?)', matchId)
                .then(r.head)
                .then(function(matchDetails){
                    var matchDetail = {}
                    if(matchDetails.length) {
                        matchDetail = matchMap(matchDetails[0]);
                        matchDetail.Players = r.map(function(match) {
                            var player = playerMap(match);
                            player.AliasBase64 = player.AliasBase64.toString('base64');
                            return player;
                        }, matchDetails);
                    }
                    return matchDetail;
                });
        };
    }()),
    getMatchByPlayer: function(playerId, recordOffset, recordCount) {
        var matchMap = util.fieldMap({
            "MatchId": "MatchId",
            "ServerId": "ServerId",
            "HostName": "HostName",
            "Map": "Map",
            "Mod": "Modification",
            "JoinTime": "PlayerJoinTime",
            "StayDuration": "PlayerStayDuration",
            "MatchStart": "MatchStart",
            "Skin": "Skin",
            "Model": "Model",
            "Frags": "Frags",
            "PantColor": "PantColor",
            "ShirtColor": "ShirtColor"
        });
        return db.getPagedData('spPlayerMatches', [playerId], recordOffset, recordCount, matchMap);
    },
    getMatchByServer: function(serverId, recordOffset, recordCount) {
        var matchMap = util.fieldMap({
            "MatchId": "MatchId",
            "ServerId": "ServerId",
            "HostName": "HostName",
            "Map": "Map",
            "Mod" : "Modification",
            "MatchStart": "MatchStart",
            "MatchDuration": "MatchDuration",
            "PlayerCount": "PlayerCount"
        });
        return db.getPagedData('spServerMatches', [serverId], recordOffset, recordCount, matchMap);
    }
};

module.exports = match;