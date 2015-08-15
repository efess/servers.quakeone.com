var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var Cacheable = Backbone.Model.extend({
    expirationSecs: function () {
        return 60;
    },
    fetch: function (options) {
        var self = this;
        
        options = options ? _.clone(options) : {};
        if (options.parse === void 0) options.parse = true;
        var model = this;
        var success = options.success;
        var response = function (resp) {
            if (!model.set(model.parse(resp, options), options)) return false;
            if (success) success(model, resp, options);
        };
        options.success = function (resp) {
            
            self.setCache(resp, options);
            response(resp);
            model.trigger('sync', model, resp, options);
        };

        var respo = this.fetchCached(options);
        if (respo) {
            return response(respo);
        }
       
        var error = options.error;
        options.error = function(resp) {
            if (error) error(model, resp, options);
            model.trigger('error', model, resp, options);
        };
        
        return this.sync('read', this, options);
    },
    fetchCached: function (options) {
        if(!Backbone.cache){
            Backbone.cache = [];
        }
        var data = options.data;
        var url = this.url();
        var cacheObject = null;
        for (var cacheIndex in Backbone.cache) {
            var cache = Backbone.cache[cacheIndex];
            if (cache.url === url
                && _.isEqual(cache.postdata, data)) {
                cacheObject = cache;
                break;
            }
        }
        if (!cacheObject) {
            return null;
        }
        else if (cacheObject.expires < new Date()) {
            var index = $.inArray(cacheObject, Backbone.cache );
            if (index > -1) {
                Backbone.cache.splice(index, 1);
            }
        } else {
            return cacheObject.data;
        }
    },
    setCache: function (resp, options) {
        var expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + this.expirationSecs());
        Backbone.cache.push({
            postdata: options.data,
            url: this.url(),
            expires: expiration,
            data: resp
        });
    }
});

module.exports = Cacheable;
