var db = require('../db')
var user = {
	get: function(user, password){
		return db.query('SELECT * FROM UserAccess where ?', {Name: user, Password: password});
	}
}

module.exports = user;