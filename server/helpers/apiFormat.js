var util = require('./util');
var r = require('ramda');

var apiFormat = {
    json: {
        transform: function(data){
            return JSON.stringify(data);
        },
        contentType: 'application/json'
    },
    proquake: {
        transform: function(servers){
            var pad = util.pad;
            return r.map(function(s){
                return s.DNS + ':' + s.Port + '\t' +
                    s.Region + ' ' + 
                    pad(s.Name.substr(0, 19), 20,' ', pad.STR_PAD_RIGHT) +
                    pad(s.CurrentPlayerCount, 2, '0', pad.STR_PAD_LEFT) + '/' +
                    pad(s.MaxPlayers, 2, '0', pad.STR_PAD_RIGHT) + ' ' +
                    pad(s.Map.substr(0, 6), 7,' ', pad.STR_PAD_RIGHT) +
                    s.Mod;
            }, servers).join('\n');
        },
        contentType: 'text/plain'
    }
};

module.exports = apiFormat;