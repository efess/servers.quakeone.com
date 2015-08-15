var mysql = require('mysql');
var promise = require('promise');
var config = require('./config');


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
            return new promise(function(resolve,reject) {
                connection.query(query, tokens, function(err, rows, fields) {
                    if(err){
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });            
        });
    }
}

module.exports = db;