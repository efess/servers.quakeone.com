var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var config = require('./config');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

config.load();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  store: new FileStore({ttl: 2236456456435634, path: config.sessionPath}),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {  }
}))

var port = process.env.PORT || config.listenPort || 8080;

app.use(express.static(config.publicDir));
app.use(require('./controllers'));

app.listen(port);
console.log('Server is listening on port ' + port);