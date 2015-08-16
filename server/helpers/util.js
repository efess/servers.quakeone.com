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
    mapIndexed: r.curry(function(fn, array) {
        // fn(value, index)
        var idx = 0;
        return r.map(function(value) {
                fn(value, idx++);
            }, array);
    }),
    setProp: r.curry(function (prop, objInstance, value) { 
        objInstance[prop] = value;
    }),
    formatDate: function(date) {
        return [date.getFullYear(), date.getMonth(), date.getMonth()].join('-');
    }, 
    intInRange: function(value, min, max) {
        var val = parseInt(value);
        return val && Math.min(Math.max(val, min), max)
    }
}
    


module.exports = util;