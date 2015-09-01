/* global fn */
var db = require('../db');
var cache = require('../cache');
var Promise = require('promise');
var r = require('ramda');
var xml = require('xml2js');
var util = require('../helpers/util')

var xmlParser = new xml.Parser({explicitArray: false});

var maps = {
    GameId: {
        0: 'NetQuake',
        1: 'QuakeWorld',
        2: 'Quake2',
        3: 'Quake3',
        4: 'Quake4'
    },
    Status: {
        0: 'Running',
        1: 'NotResponding',
        2: 'NotFound',
        3: 'QueryError'
    }
}

var processPlayerData = (function() {
    var playerMap = util.fieldMap({
        'PlayerId': 'PlayerId',
        'Name': 'Name',
        'NameBase64': 'NameBase64', 
        'Score': 'CurrentFrags',
        'TotalScore':'TotalFrags',
        'CurrentFPM': 'FragsPerMinute',
        'TotalPlayTime': 'UpTime',
        'Skin': 'Skin',
        'Model': 'Model',
        'Shirt': 'Shirt',
        'Pant': 'Pant'
    });
    return function(server) {
        server.CurrentPlayerCount = 0;
        server.Players = [];
        if(!server.PlayerData) {
            return Promise.resolve(server);
        } else {
            return new Promise(function(resolve,reject) {
                xmlParser.parseString(server.PlayerData, function(err, result) {
                    if(result) {
                        if(result.Players){
                            var players = result.Players.Player;
                            server.Players = r.map(playerMap, 
                                r.filter(function(player) { 
                                    return !!player && player.PlayerId; 
                                }, players));
                            server.CurrentPlayerCount = players.length;
                        }
                        resolve(server);
                    } else {
                        reject(err);
                    }
                });
            });
        }   
    }
}());

// Yes.. Mutates state.
var mapFieldValue = r.curry(function(fieldName, server) { 
    server[fieldName] = maps[fieldName][server[fieldName]];
    return server;
});

var sortServers = function(servers) {
    return servers.sort(function(serverA, serverB) {
        if(serverA.CurrentPlayerCount === serverB.CurrentPlayerCount){
            return serverA.RecentActivity > serverB.RecentActivity ? -1 : 1;
        }
        return serverA.CurrentPlayerCount > serverB.CurrentPlayerCount ? -1 : 1;
    });    
}

var server = {
	getStatusByGame: function(gameId) {
        var fieldMap = util.fieldMap({
            'DNS': 'DNS',
            'IPAddress': 'IpAddress',
            'Port': 'Port',
            'TimeQueried': 'Timestamp',
            'Name': 'ServerName',
            'MaxPlayers': 'MaxPlayers',
            'Mod': 'CustomModificationName',
            'Map': 'Map',
            'Region': 'Region',
            'Location': 'Location',
            'GameId': 'GameId',
            'Status': 'CurrentStatus',
            'CurrentPlayerCount': 'CurrentPlayerCount',
            'Players': 'Players',
            'ServerId': 'ServerId'
        });
        
        // cache entire set
        return cache.cacheableFn(function(){ 
            return db.query('SELECT * FROM vServerDetail')
                .then(r.compose(Promise.all, r.map(processPlayerData)))
                .then(sortServers)
                .then(r.map(r.compose(mapFieldValue('Status'), fieldMap)));
            },
            'serverStatus',
            30000)
            .then(r.filter(r.propEq('GameId', gameId)))
	},
    getHourly: function(serverId){
        var today = new Date(),
            dateFrom = util.formatDate(util.dateAddDays(today, -40)),
            dateTo = util.formatDate(util.dateAddDays(today, 1));
            
        return db.query("CALL spServerHourlySummery(?, ?, ?)", [serverId, dateFrom, dateTo])
            .then(r.compose(r.head, r.head));
    },
    getDetail: function(serverId) {
        var fieldMap = util.fieldMap({
            'DNS': 'DNS',
            'ServerId': 'ServerId',
            'IPAddress': 'IpAddress',
            'Port': 'Port',
            'TimeQueried': 'Timestamp',
            'Name': 'ServerName',
            'CurrentPlayerCount': 'CurrentPlayerCount',
            'MaxPlayers': 'MaxPlayers',
            'Mod': 'CustomModificationName',
            'Map': 'Map',
            'Region': 'Region',
            'Location': 'Location',
            'GameId': 'GameId',
            'Status': 'CurrentStatus',
            'PublicSiteUrl': 'PublicSiteUrl',
            'MapDownloadUrl': 'MapDownloadUrl',
            'Players': 'Players'
        });
        
        var processServer = function(server) {
              return processPlayerData(server)
                .then(r.compose(mapFieldValue('Status'), mapFieldValue('GameId'), fieldMap))
        };
        
        var maybeEmpty= function(fn){
            return r.cond([
                [r.isNil,   r.always(Promise.resolve({}))],
                [r.T,       fn]]);
        };
            
        return db.query('SELECT * FROM vServerDetail WHERE ServerId = ?', [serverId])
            .then(r.compose(maybeEmpty(processServer), r.head));
            
    },
    getMapStats: function(serverId, date) {
        var processRecord = function(record, index) {
            return {
                Position: index,
                Map: record.Map,
				Percentage: record.Percentage
            };
        };
        return db.query('CALL spServerStatsMapPercentage(?, ?)', [date, serverId])
            .then(r.compose(util.mapIndexed(processRecord), r.head));
    },
    getPlayerPlayTime: function(serverId, date){
        var processRecord = function(record, index) {
            return {
                Position: index,
                PlayTime: record.TimeSpent,
				PlayerId: record.PlayerId,
				AliasBase64: record.AliasBytes && record.AliasBytes.toString('base64')
            };  
        };
        
        return db.query('CALL spServerPlayerWeeklyPlayTime(?, ?)', [date, serverId])
            .then(r.compose(util.mapIndexed(processRecord), r.head));
    },
    getPlayerRanks: function(serverId, date){
        var processRecord = function(record, index) {
            return {
                Position: index,
                MatchId: record.MatchId,
				PlayerId: record.PlayerId,
				FPM: record.FPM,
				AliasBase64: record.AliasBytes && record.AliasBytes.toString('base64')
            };
        };
        
        return db.query('CALL spServerPlayerWeeklyRanking(?, ?)', [date, serverId])
            .then(r.compose(util.mapIndexed(processRecord), r.head));
    },
    allDefinitions: function() {
        return db.query('SELECT * FROM GameServer');
    },
    getDefinition: function(id) {
        return db.query('SELECT * FROM GameServer WHERE ServerId = ?', [id])
            .then(r.head);
    },
    setDefinition: function(server){
        if(!server.ServerId) {
            server.ServerId = -1; // Insert
        }
        var createTokenString = function(length){
            return r.map(r.always('?'), new Array(length)).join(', ');
        };
        var updateParamKeys = [
            'ServerId',
            'GameId',
            'CustomName',
            'AntiWallHack',
            'Port',
            'DNS',
            'PublicSiteUrl',
            'MapDownloadUrl',
            'Location',
            'QueryInterval',
            'Region',
            '----JustDoNull',
            'CustomNameShort',
            'ModificationCode',
            'Category',
            'Active',
            'CustomModificationName'
        ];
        
        var updateParams = r.map(function(key){
            return server[key] || null; 
        }, updateParamKeys);
        
        return db.query('CALL spAddUpdateGameServer(' + createTokenString(updateParamKeys.length) +')', updateParams);
    },
    deleteDefinition: function(id) {
        return db.query('CALL spRemoveGameServer(?)', [id]);
    }
    
    
    
    // update_server_definition($server_definitions){
        
        
    //     $initiate_connection = self::connection();
    //     $query = "CALL spAddUpdateGameServer(" . self::clean_string($server_definitions["ServerId"]) . ", "
    //         . self::clean_string($server_definitions["GameId"]) . ", "
    //         . "'" . self::clean_string($server_definitions["CustomName"]) . "', "
    //         . "'" . self::clean_string($server_definitions["AntiWallHack"]) . "', "
    //         . self::clean_string($server_definitions["Port"]) . ", "
    //         . "'" . self::clean_string($server_definitions["DNS"]) . "', "
    //         . "'" . self::clean_string($server_definitions["PublicSiteUrl"]) . "', "
    //         . "'" . self::clean_string($server_definitions["MapDownloadUrl"]) . "', "
    //         . "'" . self::clean_string($server_definitions["Location"]) . "', "
    //         . "'" . self::clean_string($server_definitions["QueryInterval"]) . "', "
    //         . "'" . self::clean_string($server_definitions["Region"]) . "', "
    //         . "null, " // JUST DO NULL...
    //         . "'" . self::clean_string($server_definitions["CustomNameShort"]) . "', "
    //         . "'" . self::clean_string($server_definitions["ModificationCode"]) . "', "
    //         . "'" . self::clean_string($server_definitions["Category"]) . "', "
    //         . "'" . self::clean_string($server_definitions["Active"]) . "', "
    //         . "'" . self::clean_string($server_definitions["CustomModificationName"]) . "');";

    //     self::execute_query($query)
    //         or die('Error executing query: ' . mysql_error());

    // }
}

module.exports = server;