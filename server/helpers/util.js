var r = require('ramda');

var util = {
    pad: (function(){
        var paddy = function(str, len, pad, dir) {
            if (typeof(len) == "undefined") { var len = 0; }
            if (typeof(pad) == "undefined") { var pad = ' '; }
            if (typeof(dir) == "undefined") { var dir = this.STR_PAD_RIGHT; }
        
            if (len + 1 >= str.length) {
        
                switch (dir){
        
                    case this.STR_PAD_LEFT:
                        str = Array(len + 1 - str.length).join(pad) + str;
                    break;
        
                    case this.STR_PAD_BOTH:
                        var right = Math.ceil((padlen = len - str.length) / 2);
                        var left = padlen - right;
                        str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
                    break;
        
                    default:
                        str = str + Array(len + 1 - str.length).join(pad);
                    break;
        
                } // switch
        
            }
    
            return str;
        
        }
        paddy.STR_PAD_LEFT = 1;
        paddy.STR_PAD_RIGHT = 2;
        paddy.STR_PAD_BOTH = 3;
        
        return paddy;
    }()),
    fieldMap: r.curry(function(mappingDefinition, obj) {
        return r.mapObj(function(field){
            return obj[field];
        }, mappingDefinition);
    }),
    isArray: function(maybeArray){
        return Object.prototype.toString.call(maybeArray) === '[object Array]';
    },
    mapIndexed: r.curry(function(fn, array) {
        // fn(value, index)
        var idx = 0;
        return r.map(function(value) {
            return fn(value, idx++);
        }, array);
    }),
    setProp: r.curry(function (prop, objInstance, value) { 
        objInstance[prop] = value;
    }),
    formatDate: function(date) {
        var month = (date.getMonth()+1).toString(),
            day = date.getDate().toString();
        return [date.getFullYear(), month.length === 2 ? month : "0" + month, day.length === 2 ? day : "0" + day].join('-');
    }, 
    dateAddDays: (function () {
        var dayMs = 86400000;
        return function(date, numDays){
            return new Date(date.getTime() + (dayMs * numDays));
        };
    }()),
    intInRange: function(value, min, max) {
        var val = parseInt(value);
        return val && Math.min(Math.max(val, min), max)
    }
}
    


module.exports = util;