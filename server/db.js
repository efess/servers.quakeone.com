var mysql = require('mysql');
var Promise = require('promise');
var config = require('./config');
var r = require('ramda');

var singleOperation = function(fn){
    var connection = mysql.createConnection(config.mysql);
    
    connection.connect();
    
    var result = fn(connection)
    
    connection.end();
    
    return result;
}

var db = {
    query: function(query, tokens){
        return singleOperation(function(connection){
            return new Promise(function(resolve,reject) {
                connection.query(query, tokens, function(err, rows, fields) {
                    if(err){
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });            
        });
    },
    
    getPagedData: function(storedProc, idArray, pageNumber, pageSize, recordMap){
        var recordOffset = pageNumber * pageSize;
        var payload = {
            TotalRecords: 0,
            Records: []
        };
        var createTokenString = function(length){
            return r.map(r.always('?'), new Array(length)).join(', ');
        };
        return db.query('CALL ' + storedProc + 'Count(' +createTokenString(idArray.length) + ')', idArray)
            .then(r.compose(r.head,r.head))
            .then(function(result){
                payload.TotalRecords = result.RecordCount;
                if(payload.TotalRecords) {
                    return db.query('CALL ' + storedProc + '(' +createTokenString(idArray.length + 2) + ')', 
                        idArray.concat([pageSize, recordOffset]))
                        .then(r.head)
                        .then(function(results) {
                            payload.Records = recordMap ? r.map(recordMap, results) : results;
                            
                            return payload;    
                        });
                } else {
                    return payload;
                }
            });
        
    },
    registerSequelize:  function(sequelize, DataTypes) {
        sequelize.define('WebSession', {
            sid: {
                type: DataTypes.STRING,
                primaryKey: true
            }, 
            expires: {
                type: DataTypes.DATE,
                allowNull: true
            }, 
            data: DataTypes.TEXT,
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true
            }, 
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, { tableName: 'WebSession' });
    }
}

module.exports = db;