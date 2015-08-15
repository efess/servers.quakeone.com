var fs = require('fs');
var Promise = require('promise');
var extend = require('extend');

var localConfig = 'local_config.json';

var config = {
	load: function(){
        fs.readFile(localConfig, 'utf8', function (err, data) {
            if (err) {
                console.log('Coudln\'t load local config file: '  + err);
                return;
            }
            var cfgObj = JSON.parse(data);
            extend(config, cfgObj);       
        });
	},
    // defaults
    mysql: {
        user: 'foo',
        password: 'bar',
        server: 'server',
        hostname: 'localhost'
    },
    publicDir: 'public/',
    listenPort: 8080
}

module.exports = config;