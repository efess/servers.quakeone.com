var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var config = require('./config');

config.load();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || config.listenPort || 8080;

app.use(require('./controllers'));
app.use(express.static(config.publicDir));

app.listen(port);
console.log('Server is listening on port ' + port);