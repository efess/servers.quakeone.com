

var db = require('../db');
var cache = require('../cache');
var Promise = require('promise');
var r = require('ramda');
var xml = require('xml2js');
var util = require('../helpers/util')

var match = {
    getDetail: (function(){
        var aliasMap = util.fieldMap({
            "Alias": "Alias",
            "AliasLastSeen": "AliasLastSeen",
            "AliasLastSeenAgo": "AliasLastSeenAgo",
            "AliasBase64": "AliasBase64",
            "AliasPlayerId": "AliasPlayerId"
        });
        
        var playerDetailMap = util.fieldMap({
            "PlayerId": "PlayerId",
            "PlayerNameBase64": "PlayerNameBase64",
            "LastSeenAgo": "LastSeenAgo",
            "LastSeen": "LastSeen",            
            "LastServer": "LastServer",
            "LastServerId": "LastServerId",
            "LastMap": "LastMap",
            "TotalFrags": "frags_sum",
            "TotalTime": "playtime_sum",
            "TotalFPM": "FPM",
            "YearFrags": "year_frags_sum",
            "YearTime": "year_playtime_sum",
            "YearFPM": "year_FPM",
            "MonthFrags": "month_frags_sum",
            "MonthTime": "month_playtime_sum",
            "MonthFPM": "month_FPM",
            "WeekFrags": "week_frags_sum",
            "WeekTime": "week_playtime_sum",
            "WeekFPM": "week_FPM",
            "DayFrags": "day_frags_sum",
            "DayTime": "day_playtime_sum",
            "DayFPM": "day_FPM"
        });
        
        return function(playerId, recordCount, pageNumber) {
            return db.query('CALL spPlayerDetail(?)', playerId)
                .then(r.head)
                .then(function(playerDetails){
                    var playerDetail = {}
                    if(playerDetails.length) {
                        playerDetail = playerDetailMap(playerDetails[0]);
                        playerDetail.Aliases = r.map(function(alias) {
                            var player = aliasMap(alias);
                            player.AliasBase64 = player.AliasBase64 && player.AliasBase64.toString('base64');
                            return player;
                        }, playerDetails);
                        playerDetail.PlayerNameBase64 = playerDetail.PlayerNameBase64 && 
                            playerDetail.PlayerNameBase64.toString('base64');
                    }
                    return playerDetail;
                });
        };
    }()),
    getPlayerHourly: function(playerId) {
        var dateFrom = '2013-01-01 12:00AM',
            dateTo = '2013-12-30 11:59PM';
            
        return db.query('CALL spPlayerHourlySummery(?, ?, ?)', [playerId, dateFrom, dateTo])
            .then(r.compose(r.head, r.head));
    }
};

module.exports = match;