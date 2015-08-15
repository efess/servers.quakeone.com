var memCache = require('memory-cache');
var promise = require('promise');

var cache = {
    cacheableFn: function(fn, cacheKey, ttl){
        var status = memCache.get(cacheKey);
        if(status !== null){
            return promise.resolve(status);
        } else {
            return fn().then(function(results){
                memCache.put(results, cacheKey, ttl);
                return results;
            });
        }
    }
}

module.exports = cache;