var db = require('../db')
var user = {
	getUser: function(user, password) {
		return db.query('SELECT * FROM UserAccess where Name = ? AND Password = ?', [user, password]);
	}
}

module.exports = user;