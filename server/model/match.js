var db = require('../db');
var cache = require('../cache');
var Promise = require('promise');
var r = require('ramda');
var xml = require('xml2js');
var util = require('../helpers/util')

var getPagedMatches = function(storedProc, id, recordOffset, recordCount, recordMap){
    var payload = {
        TotalRecords: 0,
        Records: []
    };
    
    return db.query('CALL ' + storedProc + 'Count(?)', id)
        .then(r.compose(r.head,r.head))
        .then(function(result){
            payload.TotalRecords = result.RecordCount;
            if(payload.TotalRecords) {
                return db.query('CALL ' + storedProc + '(?, ?, ?)',[id, recordCount, recordOffset])
                    .then(r.head)
                    .then(function(results) {
                        payload.Records = recordMap ? r.map(recordMap, results) : results;
                        
                        return payload;    
                    });
            } else {
                return payload.TotalRecords;
            }
        });
    
};

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
            return db.query('CALL spServerRecentMatches(?)', gameId)
                .then(r.head)
                .then(r.map(fieldMap));
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
        return getPagedMatches('spPlayerMatches', playerId, recordOffset, recordCount);
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
        return getPagedMatches('spServerMatches', serverId, recordOffset, recordCount, matchMap);
    }
};

module.exports = match;